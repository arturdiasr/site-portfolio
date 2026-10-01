const {createClient} = require('next-sanity');
const client = createClient({projectId: '0rdhamr8', dataset: 'production', useCdn: false, apiVersion: '2023-01-01'});
client.fetch('*[_type == "gallery"]').then(res => console.log('Galleries:', res.length));
