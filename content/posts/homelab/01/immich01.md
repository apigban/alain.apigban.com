---
title: "Deploy a new version of Immich using Ansible and Podman"
date: 2025-01-10T11:36:00+04:00
hero: images/posts/homelab-01/immich01.png
menu:
  sidebar:
    name: Deploy a new version of Immich
    identifier: update-immich
    parent: Homelab
    weight: 10
---
This post outlines the process for deploying a new version of Immich, a self-hosted photo and video backup solution. The deployment is managed using an Ansible playbook.

### Prerequisites

- Access to the server where Immich is deployed.
- Ansible installed and configured to manage the target server.
- The Ansible playbook `update-immich.yaml`.

### Deployment Procedure

The deployment process is automated using the provided Ansible playbook (TODO: Publish to github). The playbook performs the following key steps:

1. **Stop Existing Containers:** The playbook begins by stopping all running containers defined within the `media01.pods` variable. This ensures a clean state before deploying the new version.
    
    ```yaml
    - name: Stop a container
      containers.podman.podman_container:
        name: "{{ item.name }}"
        state: stopped
      loop: "{{ media01.pods }}"
    ```
    
2. **Update Immich Server Container:** A new container for the Immich server is created or updated with the specified `release_version`. The playbook uses the `podman_container` module to manage the container lifecycle.
    
    ```yaml
    - name: Update immich to "{{ release_version }}"
      block:
        - name: Create immich_server container {{ release_version }}
          become_user: "{{ media01.container.default.user }}"
          containers.podman.podman_container:
            name: "{{ media01.pods.2.name }}"
            image: "{{ media01.pods.2.image }}:{{ release_version }}"
            state: started
            restart_policy: always
            volume:
              - /etc/localtime:/etc/localtime:ro
              - "{{ media01.pods.2.name }}_library:/usr/src/app/upload"
              - "{{ media01.pods.2.name }}_external_libraries:/usr/src/app/external:ro"
            recreate: true
            network:
              - immich_network
            ports:
              - 2283:2283
            env:
              DB_PASSWORD: "{{ media01.pods.0.environment_variables.POSTGRES_PASSWORD }}"
              DB_HOSTNAME: "{{ media01.pods.0.name }}"
              DB_USERNAME: "{{ media01.pods.0.environment_variables.POSTGRES_USER }}"
              DB_DATABASE_NAME: "{{ media01.pods.0.environment_variables.POSTGRES_DB }}"
              REDIS_HOSTNAME: "{{ media01.pods.1.name }}"
    ```
    
    Key configurations for the `immich_server` container include:
    
    - **Image:** The container image is updated to the specified `release_version`.
    - **Restart Policy:** The `restart_policy` is set to `always`, ensuring the container restarts automatically if it fails.
    - **Volumes:** Mount points are defined for `/etc/localtime`, the application's upload directory, and external libraries.
    - **Network:** The container is connected to the `immich_network`.
    - **Ports:** Port 2283 is mapped to the host.
    - **Environment Variables:** Database and Redis connection details are passed as environment variables.

3. **Update Immich Machine Learning Container:** Similar to the server container, the `immich_machine_learning` container is updated to the new `release_version`.
    
    ```yaml
        - name: Create immich_machine_learning container {{ release_version }}
          become_user: "{{ media01.container.default.user }}"
          containers.podman.podman_container:
            name: "{{ media01.pods.3.name }}"
            image: "{{ media01.pods.3.image }}:{{ release_version }}"
            state: started
            volume:
              - "{{ media01.pods.3.name }}_remote:/cache"
            recreate: true
            network:
              - immich_network
            env:
              DB_PASSWORD: "{{ media01.pods.0.environment_variables.POSTGRES_PASSWORD }}"
              DB_HOSTNAME: "{{ media01.pods.0.name }}"
              DB_USERNAME: "{{ media01.pods.0.environment_variables.POSTGRES_USER }}"
              DB_DATABASE_NAME: "{{ media01.pods.0.environment_variables.POSTGRES_DB }}"
              REDIS_HOSTNAME: "{{ media01.pods.1.name }}"
            generate_systemd:
              path: "{{ media01.container.default.volume.systemd_container_path }}"
              restart_policy: "{{ media01.container.default.restart_policy }}"
              time: 120
              names: true
              container_prefix: container
    ```
    
    The `immich_machine_learning` container is configured with:
    
    - **Image:** Updated to the specified `release_version`.
    - **Volume:** A volume is mounted for caching purposes.
    - **Network:** Connected to the `immich_network`.
    - **Environment Variables:** Database and Redis connection details are configured.

### Running the Playbook

To execute the playbook, navigate to the directory containing the `update-immich.yaml` file and run the following Ansible command:

```bash
ansible-navigator run --eei localhost/role-dev-ee -m stdout update-immich.yaml -i inventory/inventory.yaml
```

Ansible will connect to the target host (`mediaserver`) and execute the tasks defined in the playbook.

### Verification

After the playbook execution completes, verify the successful deployment by checking the running container versions. This can be done using `podman ps` on the target server. Ensure the `immich_server` and `immich_machine_learning` containers are running with the expected `release_version`.

{{< img src="/posts/shortcodes/immich02.png" align="center" title="podman ps" >}}

{{< vs 3 >}}

{{< img src="/posts/shortcodes/immich03.png" align="center" title="Immich v1.124.2" >}}

{{< vs 3 >}}