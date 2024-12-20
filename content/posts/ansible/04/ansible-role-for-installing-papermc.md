---
title: "Ansible Role for Installing PaperMC"
date: 2024-12-20T15:00:00+04:00
hero: images/posts/ansible-04/first-wood-house.png
menu:
  sidebar:
    name: Ansible Role for Installing PaperMC
    identifier: ansible-role-for-installing-papermc
    parent: Ansible
    weight: 10
---
#### From Bedrock to Java: My Reseach for the Ultimate Minecraft Experience (with a little help from Ansible)

###### Repository: https://github.com/apigban/papermc_role

My journey into the world of Minecraft server administration started in October 2024, a shared adventure with my daughter. Like many others, we initially dove into the Bedrock edition, quickly setting up a server on our home network. It wasn't the most elegant setup – a hastily configured LXC container in Proxmox, a far cry from well-documented infrastructure. I even dabbled with PufferPanel, but I just preferred using the Cli, so I ditched Pufferpanel.

As time went on, my daughter's liking for Minecraft grew, fueled by the amazing content creators she follows on YouTube. And that's where the itch to switch to a Java server began. The vibrant modding scene, the sheer variety of servers – it was clear that the Java ecosystem offered something Bedrock couldn't match (yet).

My research led me down the rabbit hole of server administration. A particularly insightful thread on the r/admincraft subreddit ([https://www.reddit.com/r/admincraft/comments/1aiz0me/whats_your_server_infrastructure/](https://www.reddit.com/r/admincraft/comments/1aiz0me/whats_your_server_infrastructure/)) highlighted the dedicated community of sysadmins and developers who build and maintain their own infrastructures. Reading about their setups, often automated with scripting and configuration management tools, was inspiring. I've decided that we were going Java.

Now, simply setting up a server wasn't enough. I wanted to do it right, to automate the process, to make it repeatable. That's where Ansible came in. I decided to codify the server setup into an Ansible role. I'll walk you through the key tasks:

## Diving into the Ansible Role

The heart of our Java server deployment lies in the Ansible role I crafted. The `tasks/main.yml` file orchestrates the foundational setup:

```yaml
---
- name: Create ansible user
  become: true
  become_user: root
  ansible.builtin.user:
    name: "{{ user.name }}"
    home: "{{ user.home_dir }}"
    create_home: true
    state: present
```
This initial task ensures a dedicated user for the Minecraft server exists, creating their home directory if it doesn't. It's about good practice – isolating the server process.

```yaml
- name: Set hostname
  ansible.builtin.hostname:
    name: "{{ inventory_hostname }}"
```
Next, we set the hostname. Simple, but crucial for identification within the network.

```yaml
- name: Install packages
  become: true
  become_user: root
  ansible.builtin.dnf:
    name: "{{ packages | list }}"
    state: latest
```
This task installs the necessary packages. We're using `dnf` here, implying a Red Hat-based system (specifically Almalinux 9.4), but this could easily be adapted for Debian-based systems using `apt`.

```yaml
- name: Allow traffic to java and bedrock ports
  become: true
  become_user: root
  ansible.posix.firewalld:
    port: "{{ item }}"
    state: enabled
    permanent: true
    immediate: true
  loop: "{{ firewall_ports }}"
```
Firewall configuration is important. This task uses `firewalld` to open the necessary ports for both Java and Bedrock. I've setup plugins that allow cross-play between the server types.

```yaml
- name: Create a papermc directory
  ansible.builtin.file:
    path: "{{ papermc_dir }}"
    state: directory
    owner: "{{ user.name }}"
    mode: '0755'
```
We then create the dedicated directory for the PaperMC server files, ensuring the correct ownership and permissions.

```yaml
- name: Download PaperMC
  ansible.builtin.get_url:
    url: "{{ paperMC_url }}"
    dest: "{{ papermc_dir }}/paper-{{ paperMC_version }}-{{ paperMC_build }}.jar"
    owner: "{{ user.name }}"
    mode: '0775'
```
This task downloads the PaperMC server JAR file, the heart of our Java server. Variables ensure we can easily update the version later.

```yaml
- name: Copy paperMC to /usr/local/bin/
  become: true
  become_user: root
  ansible.builtin.copy:
    src: "{{ papermc_dir }}/paper-{{ paperMC_version }}-{{ paperMC_build }}.jar"
    dest: "{{ papermc_server_jar_path }}"
    remote_src: true
    owner: "{{ user.name }}"
    mode: '0755'
```
For easier management, the JAR is copied to `/usr/local/bin/`.

```yaml
- name: Copy the papermc-start.sh script to the papermc directory
  ansible.builtin.copy:
    src: "files/papermc-start.sh"
    dest: "{{ papermc_dir }}/papermc-start.sh"
    owner: "{{ user.name }}"
    mode: '0775'
```
A startup script is essential. This task copies our `papermc-start.sh` script to the server directory.

```yaml
- name: Accept EULA
  ansible.builtin.template:
    src: "{{ eula_template_src }}"
    dest: "{{ papermc_dir }}/eula.txt"
    owner: "{{ user.name }}"
    mode: '0775'
```
This task uses a template to automatically accept the Minecraft EULA.

```yaml
- name: Install and configure plugins
  ansible.builtin.import_tasks: plugins.yml
```
To keep things organized, plugin installation is handled in a separate file.

```yaml
- name: Include papermc server configuration variables
  ansible.builtin.include_vars:
    dir: vars
    files_matching: server_properties.yml
```
We include variables from a dedicated file for server properties.

```yaml
- name: Create server.properties from template
  ansible.builtin.template:
    src: "{{ server_properties_template_src }}"
    dest: "{{ papermc_dir }}/server.properties"
    owner: "{{ user.name }}"
    mode: '0775'
```
The `server.properties` file is generated from a Jinja2 template, allowing for dynamic configuration.

```yaml
- name: Create cron entry to start papermc server on host reboot
  ansible.builtin.cron:
    name: "Start papermc server on host reboot"
    special_time: reboot
    job: "{{ papermc_cron_job }}"
    user: "{{ user.name }}"
```
Ensuring the server starts on reboot is crucial for a hands-off approach.

```yaml
- name: Reboot the server
  become: true
  ansible.builtin.reboot:
    msg: "{{ reboot_message }}"
    connect_timeout: 10
    reboot_timeout: 90
```
Finally, the server is rebooted to apply all the changes.

The `tasks/plugins.yml` file handles the installation of essential plugins:

```yaml
---
- name: Create a papermc plugins directory
  ansible.builtin.file:
    path: "{{ paperMC_plugins_path }}"
    state: directory
    owner: "{{ user.name }}"
    mode: '0755'
```
First, we ensure the plugins directory exists.

```yaml
- name: Download PaperMC plugins
  ansible.builtin.get_url:
    url: "{{ paperMC_plugins[item].download.url }}"
    dest: "{{ paperMC_plugins_path }}/{{ paperMC_plugins[item].download.filename }}"
    owner: "{{ user.name }}"
    mode: '0775'
  loop: "{{ paperMC_plugins | dict2items | map(attribute='key') | list }}"
  changed_when: true
  notify: Initialize papermc server
```
This task downloads the specified plugins. The `loop` iterates through a dictionary of plugins, defined in our variables.

```yaml
- meta: flush_handlers
```
This ensures any pending handlers are executed before proceeding.

```yaml
- name: Create Geyser Config
  become: true
  become_user: root
  ansible.builtin.copy:
    src: "files/geyser-config.yml"
    dest: "{{ user.home_dir }}/papermc/{{ paperMC_plugins.geyser.config.path }}"
    owner: "{{ user.name }}"
    mode: '0755'
```
We're using Geyser to allow Bedrock players to join our Java server. This task copies the Geyser configuration file.

```yaml
- name: Copy the key.pem file to Geyser-Spigot path
  ansible.builtin.copy:
    src: "{{ user.home_dir }}/papermc/plugins/floodgate/key.pem"
    dest: "{{ user.home_dir }}/papermc/plugins/Geyser-Spigot/key.pem"
    remote_src: true
    owner: "{{ user.name }}"
    mode: '0755'
  changed_when: true
  notify: Initialize papermc server
```
Finally, we copy the necessary key file for Floodgate, which works with Geyser to allow Bedrock authentication.

## The Joy of Seeing My Daughter put her first block on the world

The transition to a Java server, orchestrated by Ansible, has been rewarding. 

Seeing my daughter explore the worlds her favorite YouTubers play on, the excitement in her voice as she discovers new mods and server types. While the initial Bedrock server served its purpose, the move to Java has opened up a whole new dimension of Minecraft for us. 

## What happens to the Bedrock World we started on?

The question that lingers is 'what becomes of our original Bedrock world'? The one where this whole adventure began.

 I'm still exploring the possibilities of migrating it to Java. The technical hurdles are significant (because I have never done it before), and frankly, I'm not even sure if a seamless transfer is possible. But the thought of losing those digital memories we built together – her first clumsy block placements, the little houses we designed – that's a tough pill to swallow.

So, for now, while I delve into the intricacies of world conversion, our Bedrock server remains. It's a quiet archive of our early Minecraft days, a digital time capsule of father-daughter adventures. Perhaps we'll revisit it from time to time, a nostalgic trip back to where it all started.