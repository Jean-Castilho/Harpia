document.addEventListener('htmx:afterSwap', function(event) {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');

        // Remove active class from all links first
        link.classList.remove('active');

        // Special handling for the root path '/'
        if (linkHref === '/' && currentPath === '/') {
            link.classList.add('active');
        } else if (linkHref !== '/' && currentPath.startsWith(linkHref)) {
            // For other links, check if the current path starts with the link's href
            link.classList.add('active');
        }
    });
});