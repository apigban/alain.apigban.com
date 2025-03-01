---
title: "Resolving Reverse Proxy Host Header Issues"
date: 2025-03-01T23:16:00+04:00
hero: images/posts/homelab-05/reverse-proxy-problems-01.png
menu:
  sidebar:
    name: Resolving Reverse Proxy Host Header Issues
    identifier: reverse-proxy-problem
    parent: Homelab
    weight: 10
---
I was having an issue with my website. When I used my browser to navigate to https://alain.apigban.com, there was nothing displayed.

The setup is like this:

<p style="text-align:center;">User > Frontend proxy (Caddy) > Backend HTTP Server (Caddy)</p>


{{< img src="/posts/shortcodes/reverse-proxy-problems-01.png" height="400" align="center" title="request-path" >}}
{{< vs 3 >}}


The frontend proxy receives the request, and here's one line from the frontend proxy access logs:

`{"level":"debug", "ts":1740849407.8355885,"logger": "http.handlers.reverse_proxy", "msg":"upstream roundtrip", "upstream": "backend_server_1_IP:10000", "duration": 0.01451143, "request": {"remote_ip": "client_IP", "remote_port": "56466","client_ip": "client_IP", "proto": "HTTP/2.0", "method": "GET", "host": "alain.apigban.com", "uri":"/posts/ansible/02/netbox-source-of-truth/", "headers": {"Priority":["u=0, i"], "Sec-Fetch-Mode": ["navigate"], "X-Forwarded-For":["client_IP"], "Sec-Fetch-User": ["?1"], "Accept-Encoding": ["gzip, deflate, br, zstd"], "Upgrade-Insecure-Requests": ["1"], "Sec-Fetch-Dest": ["document"], "X-Forwarded-Host": ["alain.apigban.com"], "User-Agent": ["Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0"], "Accept-Language": ["en-US,en;$q=0.5"], "Sec-Fetch-Site": ["none"], "X-Forwarded-Proto": ["https"], "Te": ["trailers"], "Accept": ["text/html,application/xhtml+xml,application/xml;$q=0.9,*/*;$q=0.8"]},"tls": {"resumed": false, "version": 772, "cipher_suite": 4865, "proto": "h2", "server_name": "alain.apigban.com"}},"headers": {"Date": ["Sat, 01 Mar 2025 17:16:47 GMT"], "Content-Length":["0"], "Server": ["Caddy"]},"status":200}`

The backend server doesn't show any logs indicating that it received the request sent by the frontend proxy.  

Apparently, I was using an incorrect Caddy configuration:

```bash
    http://backend_server_1_IP:10000 {
        root /var/www/html/alain.apigban.com/public
        file_server
        log {
            output file /var/log/caddy/access-alain.apigban.com.log
        }
    }
```

The configuration is incorrect because it is discussed in caddy documentation concerning site addresses:

<p style="text-align:center;">If you specify a hostname, only requests with a matching `Host` header will be honored.</p>

It means that when the frontend proxy transparently passes the request for `https://alain.apigban.com/` to the backend servers, the backend servers will not match those requests because the site address (Host header) is backend_server_1_IP.

In detail, the request arrives at the backend Caddy server with:

- Source: Frontend Proxy
- Destination IP: `backend_server_1_IP`
- Destination Port: `10000`
- `Host` Header: `alain.apigban.com`

Because the `Host` header doesn't match `backend_server_1_IP`, the backend Caddy server _ignores_ the request. It's as if the request never arrived.

My solution was to use a catch-all site-address, meaning, omitting the `domain` part of the site-address:

```bash
    :10000 {
        root * /var/www/html/alain.apigban.com/public

        # Enable the static file server.
        file_server
        # Enable logging
        log {
            output file /var/log/caddy/access-alain.apigban.com.log
        }
    }
```
{{< img src="/posts/shortcodes/reverse-proxy-problems-02.png" height="500" align="center" title="request-path" >}}
{{< vs 3 >}}