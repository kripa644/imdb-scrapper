import axios from "axios";
import request from "request";
import cheerio from "cheerio";
import { readFile } from "fs";
import { node, encase, chain, fork, encaseP } from "fluture";
const fs = require("fs");

// encasing an axios propmise

const fetchAxios = encaseP(axios);

// request post with curried function

const requestPosts = () => fetchAxios("https://www.imdb.com/?ref_=nv_home");

// getting file content and pipe it to parse it

const getFileContent = (file) =>
  node((done) => {
    readFile(file, "utf8", done);
  }).pipe(chain(encase(JSON.parse)));

// getting values from DOM elements with help of cheerio

const getValuesFromCheerio = (html) => {
  const imdb = [];
  let name, collection;
  let $ = cheerio.load(html);
  $(
    'div[class="TopBoxOfficeTitle__BoxOfficeTitleName-dujkoe-1 fpNAXa"]'
  )
  .each(function (index, element) {
    if(index == 0) {
      name = element.children[0].data;
      imdb.push({name})
    }   
  })

  $(
    'div[class="TopBoxOfficeTitle__BoxOfficeGrossAmount-dujkoe-5 bdjpKH"]'
  )
  .each(function (index, element) {
    if(index === 0) {
      collection = element.children[0].data;
      imdb.push({collection})
    }
  })

  const disc = JSON.stringify(imdb);
  fs.writeFile("output.json", disc, (err, result) => {
    if (err) console.log("error", err);
  });
};

// get IMDB data with help of request and passing it to cheerio

const getImdbData = () => {
  const get = {
    uri: "https://www.imdb.com/?ref_=nv_home",
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US,en;q=0.9",
    },
    gzip: true,
  };
  request(get, (error, res, html) => {
    if (error) {
      console.log(error);
    } else {
      getValuesFromCheerio(html);
    }
  });
};

requestPosts().pipe(
  fork((rej) => console.log("reject", rej))((res) =>
    console.log("resolve", getImdbData())
  )
);

getFileContent("output.json").pipe(fork(console.error)(console.log));