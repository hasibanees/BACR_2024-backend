import Blog from '../models/Blog.js'; // Assuming Blog model is imported
import { writeFileSync } from 'fs';
import { join } from 'path';
import xml2js from 'xml2js';
import { __dirname } from '../server.js';
// Function to generate the sitemap
const generateSitemap = async () => {
    
  try {
    // Fetch all blog posts from the database
    const blogs = await Blog.find({}).select('_id name createdAt updatedAt status');

    // Define the base URL of your site
    const baseUrl = process.env.url;

    // Set default priority and change frequency
    const defaultPriority = 0.5;
    const defaultChangeFrequency = 'monthly';

    // Create an array of URLs for the sitemap
    const urls = blogs.map((blog) => {
      const priority = blog.status === 'publish' ? 1 : defaultPriority; 
      const changeFreq = blog.status === 'publish' ? 'daily' : defaultChangeFrequency;

      return {
        loc: `${baseUrl}/api/blog/${blog._id}`,
        lastmod: blog.updatedAt.toISOString(),
        priority,
        changefreq: changeFreq,
      };
    });

    // Prepare XML structure using xml2js builder
    const builder = new xml2js.Builder();
    const sitemapXml = builder.buildObject({
      urlset: {
        $: { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' },
        url: urls,
      },
    });

    // Write the sitemap to a file (in the public directory, for example)
    const sitemapPath = join(__dirname, '/uploads/sitemap.xml');
    writeFileSync(sitemapPath, sitemapXml);

    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
};

export default generateSitemap;