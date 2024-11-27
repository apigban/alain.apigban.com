# Automating Netbox Deployment with Ansible and Podman

## Introduction

Having a reliable source of truth for my infrastructure design is important. While enterprises often use AWS Systems Manager Inventory for this purpose, homelab environments need a more accessible solution. This is where Netbox comes in - an open-source infrastructure resource modeling tool that can serve as a powerful alternative for homelab environments.

## Why Netbox for My Homelab?

It began with a specific need: I needed to simulate AWS Systems Manager Inventory functionality in my homelab environment. I needed a robust source of truth for my infrastructure, and Netbox's IPAM (IP Address Management) capabilities offered the perfect solution to help get my homelab infrastructure to the desired state.

## The Technical Implementation

I've automated the Netbox deployment using Ansible and Podman on RHEL 9.3/AlmaLinux 9.4. Here's a break down the deployment process.

### Prerequisites
- AlmaLinux 9.4 or RHEL 9.3 host
- Ansible core 2.14 or higher
- `containers.podman` collection
- Access to container registries (docker.io)

### Understanding the Deployment Tasks

Here's an outline of each task in the Ansible playbook:

#### 1. Base System Configuration
```yaml
roles:
  - name: apigban.rhel-9.3-base
```
The playbook starts by applying a base RHEL 9.3 configuration role, ensuring our system meets the basic requirements for running containerized applications.

#### 2. Network Isolation
```yaml
- name: Create a podman network
  containers.podman.podman_network:
    name: ipam_net
```
We create an isolated podman network named `ipam_net`. This network separation provides better security and resource isolation for our Netbox components.

#### 3. Persistent Storage Setup
The playbook creates five persistent volumes:
- `netbox-postgres-data`: For PostgreSQL database persistence
- `netbox-redis-data`: For Redis cache data
- `netbox-media-files`: For Netbox media storage
- `netbox-reports`: For Netbox reports
- `netbox-scripts`: For custom Netbox scripts

This ensures our data persists across container restarts and updates.

#### 4. Netshoot Deployment
```yaml
- name: Deploy Netshoot Container
```
A network troubleshooting container is deployed, providing tools for debugging network-related issues within our container environment.

#### 5. PostgreSQL Database
```yaml
- name: Deploy PostgreSQL for NetBox
```
Deploys PostgreSQL 16 (Alpine-based) as the database backend for Netbox. The container uses the persistent volume we created earlier and is configured with secure credentials from our encrypted secrets file.

#### 6. Redis Cache
```yaml
- name: Deploy Redis for NetBox
```
Deploys Redis as the caching solution for Netbox, configured with data persistence enabled (`appendonly yes`).

#### 7. Netbox Application
```yaml
- name: Deploy NetBox
```
Finally, deploys the Netbox container itself with:
- Port mapping (8080:8080)
- Volume mounts for media, reports, and scripts
- Environment variables for database connection, Redis configuration, and initial superuser setup
- Integration with our isolated network

## Security Considerations

The playbook implements several security best practices:
1. All sensitive information is stored in an encrypted secrets file
2. Containers run in an isolated network
3. Persistent volumes ensure data security
4. Services run under a non-root user

## Practical Applications

With this setup, I can now:
1. Track and manage IP addresses across my homelab
2. Document network infrastructure
3. Plan and track network changes
4. Maintain an accurate inventory of network resources
5. Use Netbox as a source of truth for automation workflows

## Conclusion

This automated deployment solution provides a robust foundation for managing homelab infrastructure. While it may not be AWS Systems Manager Inventory, it offers comparable functionality for homelab environments and serves as an excellent source of truth for infrastructure management.

The combination of Ansible for automation, Podman for containerization, and Netbox for infrastructure management creates a powerful, enterprise-grade solution that's perfect for homelab environments. The automated deployment ensures consistency and repeatability, while the modular design allows for easy updates and maintenance.

## Next Steps

To get started with this solution:
1. Clone the repository
2. Configure your secrets in `inventory/secrets.yml`
3. Run the playbook using ansible-navigator
4. Access Netbox at http://your-server:8080

Remember to regularly backup your persistent volumes and keep your containers updated for security patches.