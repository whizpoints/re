const fs = require('fs');

let layoutContent = fs.readFileSync('src/app/admin/layout.tsx', 'utf-8');

const oldUseEffect = `  useEffect(() => {
    setIsClient(true);
    if (pathname !== '/auth/login') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
      } else {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.email === 'admin@whizpoint.app') {
            setIsAdmin(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [pathname, router]);`;

const newUseEffect = `  useEffect(() => {
    setIsClient(true);
    if (pathname !== '/auth/login') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
      } else {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.email === 'admin@whizpoint.app') {
            setIsAdmin(true);
          }
          
          // Verify token validity with backend to catch old or expired tokens
          fetch('/api/user/profile', {
            headers: { 'Authorization': \`Bearer \${token}\` }
          }).then(res => {
            if (res.status === 401 || res.status === 403) {
              localStorage.removeItem('auth_token');
              router.push('/auth/login');
            }
          }).catch(console.error);
          
        } catch (e) {
          console.error(e);
          localStorage.removeItem('auth_token');
          router.push('/auth/login');
        }
      }
    }
  }, [pathname, router]);`;

layoutContent = layoutContent.replace(oldUseEffect, newUseEffect);

// Also let's fix the individual admin pages to bounce on 401 just in case
fs.writeFileSync('src/app/admin/layout.tsx', layoutContent);
