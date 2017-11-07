# Localscript.js
Localscript.js is asynchronous JavaScript loader inspired by Cloudflare Rocket Loader

### Features

* Ensures that all the scripts on your page will not block the content of your page from loading
* Loads all the scripts on your page asynchronously
* Uses browser's localStorage to store scripts so they aren't refetched unless necessary 

### Usage
All script tags must have type attribute set to **text/localscript**
```javascript
<script type="text/localscript">
console.log('hello from localscript');
</script>
 ```

External JavaScript files must have **data-src** attribute instead of src attribute 
```javascript
<script type="text/localscript" data-src="your.js.min.js"></script>
```

**How to include localscript.js**
```javascript
<script defer src="js/localscript.js"></script>
```

**Expire attribute**
```javascript
<script defer src="js/localscript.js" data-expire="1800"></script>
```
Cache scripts for 1800 seconds (30 minutes) 
Default value is 3600 
 