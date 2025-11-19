const baseURI = "https://6913d16cf34a2ff1170d482e.mockapi.io/tunebox/";
let albuns;
let reviews;

function getAlbuns() {
  const settings = {
    async: true,
    crossDomain: true,
    url: "https://6913d16cf34a2ff1170d482e.mockapi.io/tunebox/albuns",
    method: "GET",
    headers: {
      "User-Agent": "insomnia/11.6.2",
    },
  };

  $.ajax(settings).done(function (response) {
    albuns = response;
    console.log(albuns);
  });
}

function getReviews() {
  const settings = {
    async: true,
    crossDomain: true,
    url: "https://6913d16cf34a2ff1170d482e.mockapi.io/tunebox/reviews",
    method: "GET",
    headers: {
      "User-Agent": "insomnia/11.6.2",
    },
  };

  $.ajax(settings).done(function (response) {
    reviews = response;
    console.log(reviews);
  });
}
