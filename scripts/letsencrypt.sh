pm2 stop proxy
echo "1"
pm2 stop redirect
echo "2"
certbot certonly --standalone -d domain.com -d example.domain.com
echo "3"
pm2 start proxy
echo "4"
pm2 start redirect
echo "5"