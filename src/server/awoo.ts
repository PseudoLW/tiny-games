import { compileAsync as sassCompile } from "sass";
(async () => {
    try {
        const x = await sassCompile('./src/styles/main.sass');
        console.log(x.css);
    }
    catch {
        console.log('whoops');

    }
})();