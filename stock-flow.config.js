
module.exports = {
    apps: [
        {
            name: 'backend',
            script: 'bun',
            args: 'run start:dev',
            cwd: './backend',
            wait_ready: false,
            listen_timeout: 1000*60*5,
            kill_timeout: 1000*20,
        }, 
        {
            name: 'frontend',
            script: 'bun',
            args: 'run dev',
            cwd: './frontend',
            wait_ready: false,
            listen_timeout: 1000*60*5,
            kill_timeout: 1000*20,
        },
/*         {
            name: 'database',
            script: '/bin/bash',
            // Kita pake path absolut dan jalankan sebagai user postgres
            args: 'su - postgres -c \\"/usr/lib/postgresql/17/bin/pg_ctl -D /var/lib/postgresql/17/main start\\"',
            autorestart: false
        }, */
    ]
}







