# notion_budget_charts
Make a embeddable chart from your Notion database

1. Your Notion database should contain `price` (number) and `date_added` (date) fields.
2. Add your `notion secret`, `database id`. Change field names, if they defer from ones used in the code.
3. You need to have a proxy for Notion API to use it in website, because of cors policies. In this repository used Netlify Functions to proxy requests.
4. Deploy it.
5. You can use url to embed the chart on a Notion page.

<img width="1170" alt="image" src="https://github.com/rexolion/notion_budget_charts/assets/20303265/f8f017f2-1c85-4f37-93ff-31b325759c05">
