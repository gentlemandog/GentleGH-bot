# GentleDog-Bot

## Before use
Please properly configure the `bot.conf` file in `json format`.  
```
{
    "telegram": {
        "token": "YOUR_TELEGRAM_BOT_TOKEN",
        "chat_room": []
    },
    "github": {
        "webhook": {
            "https": {
                "key_path": "YOUR_KEY_PATH",
                "pem_path": "YOUR_PEM_PATH"
            },
            "port": 7777,
            "path": "/webhook",
            "secret": "123456"
        },
        "app": {}
    }
}
```
  
If your service is not working under HTTPs,  
Please remove `https` which in under `github.webhook` section.  
Service would auto use `http`.  