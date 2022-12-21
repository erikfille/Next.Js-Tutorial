import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData() {
  // Toma los archivos bajo el directorio /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Elimina la extensión ".md" para sacar el nombre como id del archivo
    const id = fileName.replace(/\.md$/, "");

    // Lee el archivo Markdown como un string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Usa gray-matter para parsear la sección de metadata de los posts
    const matterResult = matter(fileContents);

    // Combina la data con el id
    return {
      id,
      ...matterResult.data,
    };
  });

  // Ordena los posts por fecha
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}


// También se puede traer información de una API con fetch


/*

export async function getSortedPostsData() {
  // Instead of the file system,
  // fetch post data from an external API endpoint
  const res = await fetch('..');
  return res.json();
}

*/


// También permite hacer queries a las Databases, ya que getStaticProps solo corre en el lado del servidor, nunca del lado del cliente

/*

import someDatabaseSDK from 'someDatabaseSDK'

const databaseClient = someDatabaseSDK.createClient(...)

export async function getSortedPostsData() {
  // Instead of the file system,
  // fetch post data from a database
  return databaseClient.query('SELECT posts...')
}

*/