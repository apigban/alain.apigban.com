## alain.apigban.com: Practical Solutions and Technical Deep Dives

## https://alain.apigban.com/posts/

This blog is a journal of adventures in the constantly changing technology, specifically within the context of my homelab. It's driven by a core motivation: to meticulously document the technical challenges I encounter and the solutions I implement. Think of it as a detailed logbook of my explorations, filled with practical, step-by-step guides and illustrative code examples designed to help others navigate similar technical struggles.

I believe in sharing the nitty-gritty details, the "gotchas," and the hard-earned lessons that often get glossed over in official documentation. Posts like "[Working with Stacked Loops in Ansible](https://alain.apigban.com/posts/ansible/01/working-with-stacked-loops-in-ansible/)" and "[Operation Not Permitted: SubID showdown to Save My Family Media Database](https://alain.apigban.com/posts/linux/01/postgres/)" are prime examples of this approach, offering concrete solutions to very specific problems.

Beyond simply providing fixes, this blog serves as a vital record of my own learning journey. My homelab is my playground for experimentation, a space to tinker with new technologies and push the boundaries of my understanding. By diligently documenting this process – the successes, the failures, and everything in between – I not only solidify my own knowledge but also create a valuable resource for anyone embarking on a similar path. It's about making the often opaque world of technology more transparent and accessible.

If a post helps even one person overcome a hurdle or provides a new perspective, then the effort has been worthwhile. My goal is to contribute meaningfully to the broader technical community.

The focus on homelab projects is intentional. It reflects a hands-on approach to learning, a deep-seated curiosity about how things work, and a passion for self-hosting and managing my own infrastructure.

### How to Create New Posts

* Start by creating content on the directory `content/posts`. Subdirectories under it will be show as post categories on the website.

* To check the formatting, enable live reloads on your machine
    ```
    hugo server --bind 192.168.2.33 --baseURL http://192.168.2.33 -w
    ```

*TODO: Create deployment pipeline for tasks below*

* Commit and push to local git repo (forgejo). A successful commit will push to a [remote github repository](https://github.com/apigban/alain.apigban.com). 

* Use the playbook [update-blog.yml](https://github.com/apigban/webhost-playbook/blob/main/update-blog.yml) from the [apigban/webhost-playbook](https://github.com/apigban/webhost-playbook) repository:

    ```
    ansible-galaxy install -r requirements.yml -p roles

    ansible-navigator run --eei localhost/role-dev-ee -m stdout update-blog.yml -i inventory/inventory.yml
    ```