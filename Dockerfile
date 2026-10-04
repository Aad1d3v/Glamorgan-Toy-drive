# GLAMORGAN TOY DRIVE — static site on nginx:alpine
#
# Deployment targets
#   GitHub Pages  →  push this folder as a repo; enable "GitHub Pages" (main branch, root).
#   Render      →  "New Web Service" > Connect repo > Root directory = this folder > Deploy.
#
# Docs are at https://nginx.org/en/docs/http/ngx_http_core_module.html#directive_root
#
FROM nginx:alpine

# Copy the site (index.html, styles.css, script.js, assets/) into the default
# nginx root. Static asset paths in index.html are all relative, so they resolve
# against /usr/share/nginx/html/ automatically — no rewrite rules needed.
COPY index.html styles.css script.js /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80

# Health check: nginx itself answers / on port 80; 2s interval, 3s timeout.
HEALTHCHECK --interval=2s --timeout=3s --retries=5 --start-period=10s \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

# Render / CI may set PORT; nginx listens on 80 by default, keep it, but honour
# PORT when the orchestrator maps a different one. (nginx -g "daemon off;" is
# the standard foreground command for containers.)
STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off;"]
