# Webpack template for building complete website
*This is a working project but I'm still making some adjustments. Any help is appreciated*
You can find the template repo <a href="https://github.com/VincentVaxelaire/Rust_to_JS_Template_with_Webpack">here</a>

This is a template to build applications with Rust + wasm to a JS bundle with Webpack.
To facilitate the development of web applications the current configuration allows you to reload HTML, CSS (or SCSS) and JS files from a source folder that requires no configuration from your side.
<br>
<br>

## Usage
**To init the project :** npm install

**To start the development server :** npm run dev

**To create your distribution *(dist folder)* ready to use :** npm run build
<br>
<br>

## More informations
Use the *wasm_src* folder for your rust source code. Webpack will automatically recompile the lib.rs file after all changes. 

Use the *src* folder in the root to add your custom HTML and CSS. The *script.js* file is used to contain all the js of your application. You just need to import your files in *script.js* via an import ... from 'path/to/the/folder.js' *(Webpack will build a bundle containing all your minified js + a custom .wasm file)*. You can also write all your JS in *script.js* if you want. The *static* folder is at your disposal for all other assets like JS assets, images or custom fonts. 
<br>
<br>
<br>
<br>
PS: The pkg folder in the root can be ignored ! (if someone has a solution to block his generation I'm interested)