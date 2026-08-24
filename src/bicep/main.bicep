param location string = 'eastus'
param prefix string = 'zerotrust'

// 1. Hub VNet
resource hubVnet 'Microsoft.Network/virtualNetworks@2023-04-01' = {
  name: 'vnet-hub-${prefix}'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: [
      {
        name: 'AzureFirewallSubnet'
        properties: {
          addressPrefix: '10.0.1.0/24'
        }
      }
      {
        name: 'GatewaySubnet'
        properties: {
          addressPrefix: '10.0.2.0/24'
        }
      }
    ]
  }
}

// 2. Azure Firewall Public IP & Firewall
resource fwPublicIp 'Microsoft.Network/publicIPAddresses@2023-04-01' = {
  name: 'pip-fw-${prefix}'
  location: location
  sku: {
    name: 'Standard'
  }
  properties: {
    publicIPAllocationMethod: 'Static'
  }
}

resource azureFirewall 'Microsoft.Network/azureFirewalls@2023-04-01' = {
  name: 'fw-hub-${prefix}'
  location: location
  properties: {
    ipConfigurations: [
      {
        name: 'fw-ipconfig'
        properties: {
          subnet: {
            id: hubVnet.properties.subnets[0].id
          }
          publicIPAddress: {
            id: fwPublicIp.id
          }
        }
      }
    ]
  }
}

// 3. User Defined Route Table (Forced Tunneling to Azure Firewall)
resource routeTable 'Microsoft.Network/routeTables@2023-04-01' = {
  name: 'rt-spoke-to-firewall'
  location: location
  properties: {
    routes: [
      {
        name: 'Force-Egress-To-Firewall'
        properties: {
          addressPrefix: '0.0.0.0/0'
          nextHopType: 'VirtualAppliance'
          nextHopIpAddress: azureFirewall.properties.ipConfigurations[0].properties.privateIPAddress
        }
      }
    ]
  }
}

// 4. Spoke VNet A (Workloads)
resource spokeVnetA 'Microsoft.Network/virtualNetworks@2023-04-01' = {
  name: 'vnet-spoke-a-${prefix}'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.1.0.0/16'
      ]
    }
    subnets: [
      {
        name: 'snet-app'
        properties: {
          addressPrefix: '10.1.1.0/24'
          routeTable: {
            id: routeTable.id
          }
        }
      }
    ]
  }
}

// 5. VNet Peering: Hub <-> Spoke A
resource peeringHubToSpokeA 'Microsoft.Network/virtualNetworks/virtualNetworkPeerings@2023-04-01' = {
  parent: hubVnet
  name: 'peering-hub-to-spoke-a'
  properties: {
    remoteVirtualNetwork: {
      id: spokeVnetA.id
    }
    allowVirtualNetworkAccess: true
    allowForwardedTraffic: true
  }
}

resource peeringSpokeAToHub 'Microsoft.Network/virtualNetworks/virtualNetworkPeerings@2023-04-01' = {
  parent: spokeVnetA
  name: 'peering-spoke-a-to-hub'
  properties: {
    remoteVirtualNetwork: {
      id: hubVnet.id
    }
    allowVirtualNetworkAccess: true
    allowForwardedTraffic: true
  }
}

output firewallPrivateIp string = azureFirewall.properties.ipConfigurations[0].properties.privateIPAddress
output spokeVnetId string = spokeVnetA.id
