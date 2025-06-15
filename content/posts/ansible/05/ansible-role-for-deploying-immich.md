---
title: "Deploying Immich with Ansible and Podman"
date: 2025-06-15T03:21:00+04:00
hero: images/posts/ansible-05/immich-deploy-01.png
menu:
  sidebar:
    name: Deploying Immich with Ansible and Podman
    identifier: deploying-immich-with-ansible-and-podman
    parent: Ansible
    weight: 10
---

This post outlines the process for deploying Immich, a self-hosted photo and video backup solution, using a dedicated Ansible role. This role automates the entire setup process, from installing dependencies to deploying the necessary containers with Podman.

## Prerequisites

*   Access to the target server for Immich deployment.
*   Ansible installed on your control node.
*   This Ansible role available to your playbook.

## Usage Guide

Follow these steps to integrate and run the `apigban.podman_immich` role in your environment.

### Prerequisites

*   **Ansible**: Ensure Ansible is installed on your control node.
*   **Target Host**: A target server (e.g., `mediaserver`) with Podman installed and configured.
*   **Inventory**: An Ansible inventory file to define your target hosts.

### 1. Install the Role from ansible galaxy
[Ansible Galaxy Link](https://galaxy.ansible.com/ui/standalone/roles/apigban/podman_immich/documentation/)

Install the role from Ansible Galaxy. For project-based setups, it is a good practice to install it into a local `roles` directory.

```bash
# Installs the role in a 'roles' subdirectory
ansible-galaxy role install --roles-path ./roles apigban.podman_immich
```

### 2. Create the Playbook

Create a new YAML file (e.g., `deploy_immich.yml`) and include the role. Here is a sample playbook structure:

```yaml
# playbook.yml
- hosts: mediaserver
  become: yes # Recommended if tasks require privilege escalation

  vars:
    # Override default variables here for customization
    # For example, to set a specific version or password:
    # immich_version: "v1.106.4"
    # db_password: "your_secure_password_here"

  roles:
    - role: apigban.podman_immich
```

### 3. Configure Variables

This role's behavior is controlled by variables, with default values set in [`defaults/main.yml`](./defaults/main.yml). Review this file to see all available options.

You can override these defaults in your:
- Playbook's `vars` section (as shown above).
- Inventory file or host/group variable files.

### 4. Run the Playbook

Finally, execute your playbook, pointing to your inventory and playbook files.

```bash
ansible-playbook -i inventory/inventory.yaml deploy_immich.yml
```

### 5. Verify the Deployment

After the playbook runs, check that the services are running correctly:

1.  **Check the Containers**: SSH into your `mediaserver` and list the running containers.

    ```bash
    podman ps
    ```

    You should see all the Immich containers running (e.g., `immich-server`, `immich-postgres`, `immich-redis`).

2.  **Access the Web UI**: Open your web browser and navigate to the Immich instance.

    - **URL**: `http://<your-server-ip>:{{ immich_proxy_port }}`
    - Replace `<your-server-ip>` with your server's actual IP address.

## Role Tasks in Detail
### tasks/00-install-required-packages.yml

The first step, detailed in [`tasks/00-install-required-packages.yml`](tasks/00-install-required-packages.yml), is to install necessary packages on the target host. This includes `podman` for container management and NFS utilities if you plan to use external libraries. For Debian-based systems, `ufw` is installed and configured to allow SSH access.

```yaml
# tasks/00-install-required-packages.yml
- name: "Ensure Podman is installed"
  become: true
  ansible.builtin.package:
    name: "podman"
    state: present

- name: "Install NFS client utilities (if NFS enabled and package name determined)"
  become: true
  ansible.builtin.package:
    name: "{{ _nfs_client_package_name }}"
    state: present
  when:
    - (external_immich_upload_enabled | bool) or (external_lib_enabled | bool)
    - _nfs_client_package_name is defined and _nfs_client_package_name != ""
```

The `when` clause in the "Install NFS client utilities" task ensures that the NFS client is only installed if either external uploads or an external library are enabled in the role's configuration. It also checks that a suitable package name for the target operating system has been identified.

### tasks/01-prepare-host-directories.yml

Next, the role creates the necessary directories for Immich's data and logs as specified in [`tasks/01-prepare-host-directories.yml`](tasks/01-prepare-host-directories.yml). This includes a location for JSON logs and local mount points for external uploads and libraries if they are not already mounted.

```yaml
# tasks/01-prepare-host-directories.yml
- name: "Ensure Immich JSON logs directory exists"
  become: true
  ansible.builtin.file:
    path: "{{ immich_json_logs_location }}"
    state: directory
    owner: "{{ immich_container_uid }}"
    group: "{{ immich_container_gid }}"
    mode: '0755'
```

### tasks/02-configure-nfs-mounts.yml

If external storage via NFS is enabled, the task from [`tasks/02-configure-nfs-mounts.yml`](tasks/02-configure-nfs-mounts.yml) mounts the specified NFS shares for the upload directory and external libraries.

```yaml
# tasks/02-configure-nfs-mounts.yml
- name: "Mount IMMICH UPLOAD via NFS (if external upload enabled)"
  become: true
  ansible.posix.mount:
    src: "{{ external_immich_upload_src }}:{{ external_immich_upload_export_path }}"
    path: "{{ external_immich_upload_dst }}"
    fstype: "nfs"
    opts: "rw,sync,hard,intr"
    state: "mounted"
  when: external_immich_upload_enabled | bool
```

### tasks/02-create-podman-network-and-volumes.yml

From [`tasks/02-create-podman-network-and-volumes.yml`](tasks/02-create-podman-network-and-volumes.yml), a dedicated Podman network is created to facilitate communication between the Immich containers. Firewall rules are also added to allow traffic within this network and to expose the Immich web interface. Persistent volumes for the database, Redis, and Immich data are also created.

```yaml
# tasks/02-create-podman-network-and-volumes.yml
- name: "Create Immich Podman network"
  become_user: "{{ ansible_user }}"
  containers.podman.podman_network:
    name: "{{ immich_network_name }}"
    state: present

- name: "Create Podman volumes"
  become_user: "{{ ansible_user }}"
  containers.podman.podman_volume:
    name: "{{ item.name }}"
    state: present
  loop: "{{ podman_volumes_to_create }}"
```

### tasks/03-deploy-containers.yml

The final step, from [`tasks/03-deploy-containers.yml`](tasks/03-deploy-containers.yml), deploys the containers required for Immich to run:
*   **PostgreSQL:** The database backend.
*   **Redis:** The in-memory cache.
*   **Immich Machine Learning:** Handles tasks like image recognition.
*   **Immich Server:** The main application and API.

Here's a snippet for deploying the Immich Server container:

```yaml
# tasks/03-deploy-containers.yml
- name: "Deploy Immich Server container"
  become_user: "{{ ansible_user }}"
  containers.podman.podman_container:
    name: "immich-server"
    image: "{{ immich_server_image_name }}:{{ immich_version }}"
    user: "{{ immich_container_uid }}:{{ immich_container_gid }}"
    env:
      DB_HOSTNAME: "{{ immich_db_hostname }}"
      REDIS_HOSTNAME: "{{ immich_redis_hostname }}"
      MACHINE_LEARNING_URL: "{{ immich_machine_learning_url }}"
    volume: >-
      {{
        [
          (external_immich_upload_dst ~ ':/usr/src/app/upload:z' if external_immich_upload_enabled | bool else 'immich-upload:/usr/src/app/upload:z'),
          'immich-generated:/usr/src/app/generated:z'
        ]
        +
        ([external_lib_dst ~ ':/usr/src/app/external:ro'] if external_lib_enabled | bool and external_lib_dst else [])
      }}
    ports:
      - "{{ immich_proxy_port }}:2283"
    network:
      - "{{ immich_network_name }}"
    restart_policy: "always"
    state: started
```

The `volume` parameter for the Immich Server container uses Jinja2 templating to dynamically define the volume mounts. This allows for conditional logic:

*   **Uploads**: If `external_immich_upload_enabled` is true, it mounts the specified host path (`external_immich_upload_dst`) to the container's upload directory. Otherwise, it uses a managed Podman volume named `immich-upload`.
*   **External Library**: If `external_lib_enabled` is true and a destination path is provided, it mounts an external library path as a read-only volume. If not enabled, this mount is omitted entirely.
*   **Generated Files**: It always mounts the `immich-generated` volume for storing thumbnails and other generated media.

This approach makes the role flexible, adapting the container's storage configuration based on user-defined variables.