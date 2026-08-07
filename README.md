# Bear blog local dev env

This is my repo for developing bear blog themes in a local environment. Rather than developing themes in the bear blog dashboard's CSS input box, and hitting "publish" to see the changes, I can develop them locally. 

Bearblog compiles CSS into the HTML document for each page as a `<style>` tag. In this workflow I separate CSS into a `styles.css` file and import it into the html using a link. I can then serve it using VSCode's live server for a fast workflow. 

### Creating local dev env for your own blog
To recreate this for your own blog pages you need to copy your pages HTML as actually served (open your blog page, then press `cmd/ctrl` + `u`, then copy that). 

I recommend you run `prettier` on the html you copy into your editor because it will be an unformatted mess: `npx prettier --write default-bear-blog/index.html`