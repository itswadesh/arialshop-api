export const isYoutube = (url: string) => {
  const urll = url.toLowerCase()
  let data =
    /^(?:http:|https:)*?\/\/(?:www\.|)(?:youtube\.com|m\.youtube\.com|youtu\.|youtube-nocookie\.com).*(?:v=|v%3D|v\/|(?:a|p)\/(?:a|u)\/\d.*\/|watch\?|vi(?:=|\/)|\/embed\/|oembed\?|be\/|e\/)([^&?%#\/\n]*)/

  // return (
  //   urll.indexOf('https://youtube.com') === 0 ||
  //   urll.indexOf('https://youtu.be') === 0
  // )
  return data.test(urll)
}
