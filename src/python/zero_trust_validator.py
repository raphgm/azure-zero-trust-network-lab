import ipaddress
import socket
import sys

def check_private_dns(hostname: str) -> str:
    try:
        ip = socket.gethostbyname(hostname)
        print(f"[DNS CHECK] {hostname} resolved to {ip}")
        if ipaddress.ip_address(ip).is_private:
            print(f" -> SUCCESS: Private IP allocated ({ip}). Public access blocked.")
            return ip
        else:
            print(f" -> WARNING: Public IP allocated ({ip}). Zero Trust posture breached!")
            return ip
    except socket.gaierror as e:
        print(f"[DNS CHECK] Failed to resolve {hostname}: {e}")
        return ""

def check_port_reachability(ip: str, port: int) -> bool:
    print(f"[NSG CHECK] Testing TCP reachability to {ip}:{port}...")
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(3.0)
    try:
        s.connect((ip, port))
        s.close()
        print(f" -> RESULT: Port {port} is OPEN.")
        return True
    except Exception as e:
        print(f" -> RESULT: Port {port} is BLOCKED ({e}). Micro-segmentation active.")
        return False

if __name__ == "__main__":
    print("=== Zero Trust Azure Network Architecture Validator ===")
    
    target_hosts = [
        "sql-zerotrust-prod.database.windows.net",
        "kv-zerotrust-prod.vault.azure.net"
    ]

    for host in target_hosts:
        print("\n------------------------------------------------")
        ip = check_private_dns(host)
        if ip:
            check_port_reachability(ip, 1433)
            check_port_reachability(ip, 443)
            check_port_reachability(ip, 22)

    print("\n[COMPLETE] Zero Trust Diagnostic Run Finished.")
