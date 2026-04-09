import os
import sys
import time
import json
import uuid
import socket
import logging
import platform
import requests
import yaml
from modules.log_collector import LogCollector
from modules.process_monitor import ProcessMonitor
from modules.network_monitor import NetworkMonitor
from modules.fim import FileIntegrityMonitor
from modules.vuln_scanner import VulnScanner
from modules.sca import SecurityConfigurationAssessment
from modules.rootkit_detector import RootkitDetector

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SecureWatch-Agent")

class AgentDaemon:
    def __init__(self, config_path="config/agent.conf"):
        self.config_path = config_path
        self.config = self.load_config()
        self.event_queue = []
        self.modules = []
        
        self.server_url = f"{self.config['server']['protocol']}://{self.config['server']['host']}:{self.config['server']['port']}"
        self.agent_id = self.config['agent'].get('id')
        self.token = self.config['agent'].get('token')
        
    def load_config(self):
        if not os.path.exists(self.config_path):
            logger.error(f"Config file {self.config_path} not found!")
            sys.exit(1)
        with open(self.config_path, 'r') as f:
            return yaml.safe_load(f)
            
    def save_config(self):
        with open(self.config_path, 'w') as f:
            yaml.dump(self.config, f)

    def register(self):
        if self.agent_id and self.token:
            logger.info(f"Agent already registered with ID: {self.agent_id}")
            return True
            
        logger.info(f"Registering agent with server: {self.server_url}")
        
        payload = {
            "hostname": socket.gethostname(),
            "os_type": platform.system(),
            "os_version": platform.version(),
            "agent_version": "1.0.0",
            "group": self.config['agent'].get('group', 'default'),
            "ip_address": socket.gethostbyname(socket.gethostname())
        }
        
        try:
            response = requests.post(f"{self.server_url}/api/agents/register", json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.agent_id = data['agent_id']
                self.token = data['token']
                
                # Update config
                self.config['agent']['id'] = self.agent_id
                self.config['agent']['token'] = self.token
                self.save_config()
                
                logger.info(f"Successfully registered. ID: {self.agent_id}")
                return True
            else:
                logger.error(f"Registration failed: {response.text}")
                return False
        except Exception as e:
            logger.error(f"Connection error during registration: {e}")
            return False

    def init_modules(self):
        mods_config = self.config.get("modules", {})
        
        if mods_config.get("log_collector", {}).get("enabled"):
            mod = LogCollector(mods_config["log_collector"])
            mod.start(self.event_queue)
            self.modules.append(mod)
            
        if mods_config.get("process_monitor", {}).get("enabled"):
            mod = ProcessMonitor(mods_config["process_monitor"])
            mod.start(self.event_queue)
            self.modules.append(mod)
            
        if mods_config.get("network_monitor", {}).get("enabled"):
            mod = NetworkMonitor(mods_config["network_monitor"])
            mod.start(self.event_queue)
            self.modules.append(mod)
            
        if mods_config.get("fim", {}).get("enabled"):
            mod = FileIntegrityMonitor(mods_config["fim"])
            mod.start(self.event_queue)
            self.modules.append(mod)
            
        if mods_config.get("vuln_scanner", {}).get("enabled"):
            mod = VulnScanner(mods_config["vuln_scanner"])
            mod.start(self.event_queue)
            self.modules.append(mod)
            
        if mods_config.get("sca", {}).get("enabled"):
            mod = SecurityConfigurationAssessment(mods_config["sca"])
            mod.start(self.event_queue)
            self.modules.append(mod)
            
        if mods_config.get("rootkit_detector", {}).get("enabled"):
            mod = RootkitDetector(mods_config["rootkit_detector"])
            mod.start(self.event_queue)
            self.modules.append(mod)
            
        logger.info(f"Initialized {len(self.modules)} modules.")

    def heartbeat(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        payload = {"events": self.event_queue}
        
        try:
            # Send heartbeat and flush queue
            response = requests.post(
                f"{self.server_url}/api/agents/{self.agent_id}/heartbeat", 
                json=payload, 
                headers=headers,
                timeout=5
            )
            
            if response.status_code == 200:
                self.event_queue = [] # clear queue on success
                
                # Check for pending commands
                commands = response.json().get("commands", [])
                for cmd in commands:
                    self.execute_command(cmd)
            else:
                logger.warning(f"Heartbeat failed: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Heartbeat connection error: {e}")

    def execute_command(self, cmd_data):
        logger.info(f"Received command: {cmd_data}")
        # Command execution logic will be expanded here (kill_process, etc)
        pass

    def run(self):
        logger.info("Starting SecureWatch Agent...")
        
        # Keep trying to register until successful
        while not self.register():
            time.sleep(10)
            
        self.init_modules()
        
        heartbeat_interval = self.config['agent'].get('heartbeat_interval', 30)
        last_heartbeat = time.time()
        
        try:
            while True:
                # Poll modules
                for mod in self.modules:
                    mod.poll()
                
                # Send heartbeat
                now = time.time()
                if now - last_heartbeat >= heartbeat_interval:
                    self.heartbeat()
                    last_heartbeat = now
                    
                time.sleep(1) # Base loop sleep
        except KeyboardInterrupt:
            logger.info("Agent shutting down.")

if __name__ == "__main__":
    agent = AgentDaemon()
    agent.run()
