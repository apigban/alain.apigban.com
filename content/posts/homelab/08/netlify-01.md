---
title: "Reverse Proxy Configuration Update: Redirecting alain.apigban.com to Netlify"
date: 2025-03-16T02:02:06+04:00
hero: images/posts/homelab-08/netlify-02.png
menu: 
  sidebar:
    name: Deployment of Portfolio Website on Netlify
    identifier: netlify-01
    parent: Homelab
    weight: 10
---
I've recently made a change to the reverse proxy configuration for my domain, `alain.apigban.com`. Previously, the reverse proxy was forwarding requests to my web server at 172.21.5.201 - this is located in a vm in my homelab. However, I've updated the configuration to now forward these requests to a Netlify-hosted website.

## Current Infrastructure
This reverse proxy is hosted on an Oracle Cloud Infrastructure VM. It serves as the web traffic ingress to my homelab. The specific components involved in serving web traffic are:
* Caddy with Namecheap and CorazaWAF Modules
* Crowdsec
{{< img src="/posts/shortcodes/netlify01.png" height="100" align="center" title="podman stats" >}}
{{< vs 3 >}}

## Reason for Change
When trying out Netlify, I got asked about the site name when I clicked "Import an existing project":
{{< img src="/posts/shortcodes/netlify02.png" height="300" align="center" title="Import Project" >}}
{{< vs 3 >}}

I chose the Netlify subdomain: https://alainigbanblog.netlify.app


## New Configuration

I've changed the Caddyfile's server block to have a reverse proxy directive that points to the Netlify app:

```Caddyfile
...
        https://alain.apigban.com {
                import XXXXXXXXXXXXXXXX
                route {
                        crowdsec
                        reverse_proxy alainigbanblog.netlify.app {
                        header_up Host {upstream_hostport}
                        header_up X-Real-IP {remote_host}
                        header_up X-Forwarded-For {remote_host}
                        }
                }
                coraza_waf {
                        load_owasp_crs
                        directives `
                        Include /etc/caddy/corazawaf/ruleset/coraza.conf
                        Include /etc/caddy/corazawaf/ruleset/prod.conf
                        Include @owasp_crs/*.conf
                        SecRuleEngine On
                        `
                }
                log {
                        output file /var/log/access-alain.apigban.com.log
                }
        }
...
```
## Result

### Analysis of select access logs when a browser requests for `alain.apigban.com`


```bash
Line1:{"level":"debug","ts":1742072573.4476407,"logger":"http.handlers.reverse_proxy","msg":"selected upstream","dial":"alainigbanblog.netlify.app:80","total_upstreams":1}
```

`Line1` shows that Caddy has received a request and successfully determined that it should forward it to `alainigbanblog.netlify.app:80`:
* request timestamp: `1742072573.4476407` - March 15, 2025 21:02:53.447 GMT
* logger: `http.handlers.reverse_proxy` - reverse proxy handler has created this log
* upstream server:  `alainigbanblog.netlify.app:80` - caddy has selected this upstream address and port. This confirms that the caddy server is correctly configured to forward requests toward the Netlify app.

```bash
Line2:{"level":"debug","ts":1742073366.395293,"logger":"http.handlers.reverse_proxy","msg":"upstream roundtrip","upstream":"alainigbanblog.netlify.app:80","duration":1.203405978,"request":{"remote_ip":"94.204.187.239","remote_port":"60854","client_ip":"94.204.187.239","proto":"HTTP/2.0","method":"GET","host":"alainigbanblog.netlify.app:80","uri":"/","headers":{"Accept":["text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"],"Sec-Fetch-User":["?1"],"Accept-Encoding":["gzip, deflate, br, zstd"],"Cache-Control":["no-cache"],"X-Forwarded-For":["94.204.187.239"],"Pragma":["no-cache"],"X-Forwarded-Host":["alain.apigban.com"],"User-Agent":["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"],"Accept-Language":["en-US,en;q=0.9"],"Sec-Ch-Ua-Mobile":["?0"],"Upgrade-Insecure-Requests":["1"],"Sec-Fetch-Site":["none"],"Sec-Fetch-Dest":["document"],"Sec-Ch-Ua":["\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\""],"Priority":["u=0, i"],"Sec-Fetch-Mode":["navigate"],"Sec-Ch-Ua-Platform":["\"Windows\""],"X-Forwarded-Proto":["https"],"X-Real-Ip":["94.204.187.239"]},"tls":{"resumed":true,"version":772,"cipher_suite":4865,"proto":"h2","server_name":"alain.apigban.com"}},"headers":{"Content-Type":["text/html; charset=UTF-8"],"Date":["Sat, 15 Mar 2025 21:16:06 GMT"],"Server":["Netlify"],"Accept-Ranges":["bytes"],"Cache-Control":["public,max-age=0,must-revalidate"],"Cache-Status":["\"Netlify Edge\"; fwd=miss"],"Content-Encoding":["br"],"Age":["0"],"Etag":["\"3a5cf0d4f2dfd2144c4c58e7f92a58db-ssl-df\""],"Vary":["Accept-Encoding"],"X-Nf-Request-Id":["01JPDTM1DJ1VTGSQPY9H7P923H"]},"status":200}
```
This request was done without client-caching, the request took 1.2 seconds. `Line2` confirms that the proxy request was successful, because caddy received a`status: 200` response and sent it back to my web browser. 