---
title: "My Method for Testing Ansible Roles with Molecule and Proxmox Driver"
date: 2024-12-20T08:00:00+04:00
hero: images/posts/ansible-03/ansible01.png
menu:
  sidebar:
    name: Testing Ansible Roles
    identifier: testing-ansible-roles-with-molecule-and-proxmox-driver
    parent: Ansible
    weight: 10
---
This document outlines my method for testing Ansible roles using Molecule with the `molecule-proxmox` driver.

Thanks to [Michael Meffie](https://meffie.org/) for creating the [molecule-proxmox](https://github.com/meffie/molecule-proxmox) plugin.

## Overview

Molecule is a testing framework for Ansible roles. It has allowed me to create test scenarios that automate the process of provisioning, converging, verifying, and destroying infrastructure. The `molecule-proxmox` driver enables me to test my roles against virtual machines running on a Proxmox virtualization platform.

## Configuration Files

Molecule uses several configuration files to define the test environment and the steps involved in the testing process. I typically put these files in the `molecule/default/` directory.

### `molecule.yml`

This file defines the Molecule scenario configuration. Key settings for the `molecule-proxmox` driver include:

```yaml
driver:
  name: molecule-proxmox
  options:
    api_host: ${proxmox_api_host}
    api_port: ${proxmox_api_port}
    api_user: ${proxmox_api_user}
    api_token_id: ${proxmox_api_token_id}
    api_token_secret: ${proxmox_api_token_secret}
    node: "proxmox"
    ssh_user: ${proxmox_ssh_user}
    ssh_port: ${proxmox_ssh_port}
    ssh_identity_file: ${proxmox_ssh_identity_file}
    timeout: 300
    template_name: ${proxmox_template_name}
```

- **`driver.name`**: Specifies the driver I use, which is `molecule-proxmox` in this case.
- **`driver.options`**:  Defines the connection parameters for my Proxmox server and the virtual machine settings.
    - **`api_host`**, **`api_port`**, **`api_user`**, **`api_token_id`**, **`api_token_secret`**: Credentials for accessing the Proxmox API. I set these as environment variables.
    - **`node`**: The Proxmox node where the VM will be created.
    - **`ssh_user`**, **`ssh_port`**, **`ssh_identity_file`**: Credentials I use for accessing the test VM via SSH. I set these as environment variables.
    - **`timeout`**: The timeout in seconds for Proxmox API calls.
    - **`template_name`**: The name of the Proxmox template I use for creating the test VM.

The `platforms` section defines the target platforms for testing:

```yaml
platforms:
  - name: molecule-alma9.4
    template_name: alma9.4-template
    newid: 9988
    ciuser: ${proxmox_ciuser}
    cipassword: ${proxmox_cipassword}
    ipconfig:
      ipconfig0: 'ip=192.168.2.98/24,gw=192.168.2.1'
    nameservers:
      - 192.168.2.10
```

- **`platforms.name`**: A descriptive name for the platform.
- **`platforms.template_name`**: The name of the Proxmox template I use for this specific platform.
- **`platforms.newid`**:  A unique ID for the created VM.
- **`platforms.ciuser`**, **`platforms.cipassword`**: Credentials for the user within the test VM. I set these as environment variables.
- **`platforms.ipconfig`**: Network configuration for the test VM.
- **`platforms.nameservers`**: DNS servers for the test VM.

The `provisioner` section configures the Ansible provisioner:

```yaml
provisioner:
  name: ansible
  log: true
  config_options:
    ssh-connection:
      host_key_checking: false
  connection_options:
    ansible_ssh_user: ${proxmox_ssh_user}
    ansible_ssh_common_args: -o UserKnownHostsFile=/dev/null -o ControlMaster=auto
        -o ControlPersist=60s -o ForwardX11=no -o LogLevel=ERROR -o IdentitiesOnly=yes
        -o StrictHostKeyChecking=no
    ansible_become_pass: ${proxmox_cipassword}
  lint:
    name: "ansible-lint"
```

- **`provisioner.name`**: Specifies the provisioner, which is Ansible.
- **`provisioner.log`**: Enables Ansible log output.
- **`provisioner.config_options`**:  Ansible configuration options, such as disabling host key checking for testing purposes.
- **`provisioner.connection_options`**: Ansible connection options, including the SSH user, common arguments, and the become password. These often use environment variables.
- **`provisioner.lint`**: Configures the Ansible linting tool.

The `verifier` section defines how the role is verified:

```yaml
verifier:
  name: ansible
  enabled: true
  directory: ../../tests
```

- **`verifier.name`**: Specifies the verifier, which is Ansible.
- **`verifier.enabled`**: Enables the verifier.
- **`verifier.directory`**: Specifies the directory containing the verification playbooks.

### `converge.yml`

This playbook is executed by Molecule to bring the test instance to the desired state. It typically includes the role being tested:

```yaml
---
- name: Converge
  hosts: all
  gather_facts: true
  become: true
  vars_files:
    - ../../vars/secrets.yml
  roles:
    - role: apigban.rhel-9.3-base

  tasks:
    - name: Testing papermc_role
      ansible.builtin.include_role:
        name: apigban.papermc_role

    - name: Check uname
      ansible.builtin.raw: uname -a
      register: result
      changed_when: false

    - name: Print some info
      ansible.builtin.assert:
        that: result.stdout | regex_search("^Linux")
```

- **`roles`**: Lists the roles to be applied, including any dependencies.
- **`tasks`**: Defines additional tasks to be executed during the converge process, such as including the role under test and performing basic checks.

### `requirements.yml`

This file lists any Ansible role or collection dependencies:

```yaml
---
roles:
  - name: apigban.rhel-9.3-base
    src: git+https://git.home.apigban.com/apigban/rhel-9.3-base

collections:
  - name: devsec.hardening
```

- **`roles`**: Specifies any role dependencies and their source.
- **`collections`**: Specifies any collection dependencies.

## Testing Process

The following steps are typically involved in testing an Ansible role with Molecule and the `molecule-proxmox` driver:

1. **Install `molecule-proxmox`:** I need to ensure that  the `molecule-proxmox` driver is installed. I can install it using pip: `pip install molecule-proxmox`.
2. **Configure Environment Variables:** The necessary environment variables for connecting to my Proxmox server and accessing the test VMs needs to be set. These variables are referenced in the `molecule.yml` file (e.g., `proxmox_api_host`, `proxmox_api_token_secret`, `proxmox_ssh_user`).
3. **Run Molecule Test:** I execute the Molecule test using the command `molecule test`.

Molecule will then perform the following actions:

- **Dependency:** Install any role or collection dependencies defined in `requirements.yml`.
- **Create:** Use the `molecule-proxmox` driver to create a test VM on my Proxmox server based on the specified template and platform configuration in `molecule.yml`.
- **Converge:** Execute the `converge.yml` playbook against the created instance, applying the Ansible role being tested and any dependencies.
- **Idempotence:** Run the `converge.yml` playbook again to ensure the role is idempotent (i.e., running it multiple times produces the same result).
- **Verify:** Execute the verification playbook (typically `verify.yml` in the `tests/` directory) to check if the role has configured the system as expected.
- **Destroy:** Use the `molecule-proxmox` driver to destroy the test VM.

I can also run individual stages of the test process, such as `molecule create`, `molecule converge`, `molecule verify`, and `molecule destroy`.

This testing procedure provides a comprehensive guide for testing Ansible roles using Molecule and the `molecule-proxmox` driver, resulting in consistent and reliable ansible roles.
