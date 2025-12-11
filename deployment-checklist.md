# Hugo Site Deployment Checklist

## Deployment Details
- **Date**: 2025-12-11
- **Server URL**: http://192.168.2.234:1313
- **Hugo Version**: v0.152.2-6abdacad3f3fe944ea42177844469139e81feda6+extended
- **Environment**: Development
- **Theme**: Toha v4

## Manual Testing Checklist

| Task | Description | Expected Result | Status | Notes |
|------|-------------|----------------|---------|-------|
| **Server Status** | Verify Hugo server is running | Server responds to HTTP requests | ✅ | Running on port 1313 |
| **Homepage Load** | Navigate to main page | Site loads without errors | ✅ | Returns HTTP 200 OK |
| **HTML Validation** | Check HTML structure | Valid HTML5 markup | ✅ | DOCTYPE and proper head tags |
| **CSS Loading** | Verify stylesheets load correctly | Pages render with proper styling | ⬜ | Verify visual appearance |
| **JavaScript** | Check JS functionality | Interactive elements work | ⬜ | Test navigation and features |
| **Navigation Menu** | Click through menu items | All links work, pages load | ⬜ | Test all menu sections |
| **Blog Posts** | Access blog posts section | Posts list loads correctly | ⬜ | Check content rendering |
| **Content Rendering** | Verify markdown content | Posts display with proper formatting | ⬜ | Check for TOC, code blocks |
| **Images** | Check image loading | All images display properly | ⬜ | Verify alt tags and sizing |
| **Responsive Design** | Test on different screen sizes | Site adapts to mobile/tablet | ⬜ | Use browser dev tools |
| **Dark Mode Toggle** | If theme supports it | Switch between light/dark | ⬜ | Verify theme switching |
| **Search Functionality** | Test search feature | Returns relevant results | ⬜ | Check if search is enabled |
| **404 Page** | Navigate to non-existent URL | Custom 404 page displays | ⬜ | Test /non-existent-page |
| **Performance** | Check page load speed | Pages load within acceptable time | ⬜ | Use browser dev tools |
| **Console Errors** | Check browser console | No JavaScript errors | ⬜ | Open dev tools console |
| **Accessibility** | Basic a11y checks | Proper heading hierarchy, alt text | ⬜ | Use accessibility tools |

## Configuration Changes Made
- **Temporarily disabled sitemap generation** due to permission issues
  - Added `disableKinds: [sitemap]` to `hugo.yaml`
  - Original permission error: `open /home/ansible/alain.apigban.com-minimimalist/public/sitemap.xml: permission denied`

## Known Issues
- [ ] Sitemap generation is disabled - needs investigation for production deployment
- [ ] Permission issues with sitemap.xml file need resolution

## Troubleshooting Commands

```bash
# Check if Hugo server is running
ps aux | grep hugo

# Restart Hugo server if needed
pkill -f hugo
hugo server --bind 192.168.2.234 --baseURL http://192.168.2.234 -w

# Check logs
tail -f /var/log/hugo/hugo.log (if configured)

# Test connectivity
curl -I http://192.168.2.234:1313
```

## Deployment Notes
- Server is running in development mode with live reload enabled
- Changes to content files will automatically trigger rebuilds
- Server binds to 192.168.2.234 for network accessibility
- Fast Render Mode is enabled (full rebuild with --disableFastRender if needed)