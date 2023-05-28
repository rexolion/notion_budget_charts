const axios = require('axios');

const DATABASE_ID = "";
const NOTION_PAGE_URL = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
const NOTION_SECRET = ""; // Replace with your Notion API key
const NOTION_VERSION = "2022-06-28";

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST'
};

exports.handler = async function (event, context) {
    const body = event != null && event.body != null ? JSON.parse(event.body) : null;

    return axios.post(NOTION_PAGE_URL, {
        start_cursor: body != null && body.start_cursor != null ? body.start_cursor : undefined

    }, {
        headers: {
            'Authorization': `Bearer ${NOTION_SECRET}`,
            'Notion-Version': NOTION_VERSION
        }
    })
        .then(res => {
            console.log(res.data);
            return {
                statusCode: 200,
                body: JSON.stringify(res.data),
                headers
            };
        })
        .catch(err => {
            return {
                statusCode: 404,
                body: err,
                headers
            };
        })
}
