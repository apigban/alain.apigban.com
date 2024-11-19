---
title: "Working with Stacked Loops in Ansible"
date: 2024-11-19T16:00:00+04:00
hero: images/posts/ansible-01/0101.png
menu:
  sidebar:
    name: Stacked Loops
    identifier: working-with-stacked-loops-in-ansible
    parent: Ansible
    weight: 10
---
In my homelab environment, I recently encountered an interesting challenge: I needed to execute multiple Hugo commands across multiple website directories. This led me to explore one of Ansible's powerful features - stacked loops. In this post, I'll share my experience and show you how to effectively use stacked loops in Ansible.

## The Challenge

I maintain several Hugo-based websites in my homelab, each requiring the same set of commands for updates and maintenance. Manually running these commands for each site was becoming tedious and error-prone. I needed a way to automate:

1. Running multiple Hugo commands (mod get, tidy, npm pack, etc.)
2. Executing these commands across multiple site directories
3. Maintaining flexibility to add more sites or commands in the future

## Understanding Stacked Loops

Stacked loops in Ansible allow you to iterate over multiple lists simultaneously. Think of it as nested loops where you can:
- Loop over a list of directories (outer loop)
- For each directory, loop over a list of commands (inner loop)

## Implementation
The complete code for this implementation is available in my github repository [ansible.hugo_webhosts role](https://github.com/apigban/hugo_webhost/blob/45490b5d5cfe4dd08473e9af9b59bb763acc9fd7/tasks/deploy-websites.yml#L35C1-L42C1).


### 1. Variable Structure

First, I defined my variables to maintain a clean separation of data:

```yaml
# defaults/main.yml
hugo:
  commands:
    - hugo mod get -u 
    - hugo mod tidy
    - hugo mod npm pack
    - npm install
    - hugo

sites:
  - name: alain.apigban.com
    local_path: /var/www/html
    repo_url: https://github.com/apigban/alain.apigban.com.git
    port: 10000
  - name: example.apigban.com
    local_path: /var/www/html
    repo_url: https://github.com/apigban/example.git
    port: 20000
```

### 2. Main Playbook

The main playbook structure is straightforward:

```yaml
# main.yml
- name: Update Hugo Sites
  hosts: web01
  gather_facts: true

  tasks:
  - name: Execute Hugo Commands
    ansible.builtin.include_tasks: hugo-commands.yml
    loop: "{{ sites }}"
    loop_control:
      loop_var: outer_item
```

### 3. Task Implementation

The included task file handles the nested loop:

```yaml
# hugo-commands.yml
- name: Execute commands for each site
  ansible.builtin.command: "{{ item }}"
  args:
    chdir: "{{ outer_item.local_path }}/{{ outer_item.name }}"
  loop: "{{ hugo.commands }}"
  register: command_output
```

## Understanding the Output

When you run this playbook, Ansible executes each command for each site. The output looks like this:

```bash
TASK [Execute commands] ******************
ok: [web01] => (item=hugo mod get -u) => {
    "msg": "PATH: /var/www/html/alain.apigban.com COMMAND: hugo mod get -u"
}
ok: [web01] => (item=hugo mod tidy) => {
    "msg": "PATH: /var/www/html/alain.apigban.com COMMAND: hugo mod tidy"
}
[... additional output ...]
```


## Further Reading
- [Ansible Loops Documentation](https://docs.ansible.com/ansible/latest/user_guide/playbooks_loops.html)
- [Hugo Commands Reference](https://gohugo.io/commands/)
- [Ansible Best Practices](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html)