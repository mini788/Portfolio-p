# Product Thinking portfolio

## Host locally

From this directory, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory docs
```

Open http://localhost:4173. Press `Ctrl+C` to stop the server.

## Host on GitHub Pages

1. Commit and push this repository to GitHub. The site is ready in `docs/`,
   including `.nojekyll`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your branch and the `/docs` folder, then click **Save**.
5. Open the site URL shown in the Pages settings once deployment finishes.

To update the published site, edit the files in `docs/`, then commit and push
the changes.

See [GitHub's publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
for details.
