const baseURI = "https://6913d16cf34a2ff1170d482e.mockapi.io/tunebox/";
let albuns;
let reviews;
let currentAlbumId = null;
let currentReviewId = null;

function printAlbuns(albuns) {
  let container = $("#albunsList");
  container.empty(); // Limpa o container antes de adicionar novos álbuns

  albuns.forEach((album) => {
    let albumCard = $(`
      <div class="album-card" data-album-id="${album.id}">
        <img src="${album.capa || 'https://via.placeholder.com/100'}" alt="${album.nome} Cover" class="album-cover" />
        <h3 class="album-title">${album.nome}</h3>
      </div>
    `);
    
    // Adiciona evento de clique no card do álbum
    albumCard.on('click', function() {
      openAlbumModal(album);
    });
    
    container.append(albumCard);
  });
}

function populateAlbumSelect(albuns) {
  let select = $("#albumSelect");
  select.empty(); // Limpa o dropdown
  
  // Adiciona opção padrão
  select.append($('<option>', {
    value: '',
    text: 'Selecione um álbum'
  }));
  
  // Adiciona cada álbum como opção
  albuns.forEach((album) => {
    select.append($('<option>', {
      value: album.id,
      text: `${album.nome}${album.artista ? ' - ' + album.artista : ''}`
    }));
  });
}

async function getAlbuns() {
  const settings = {
    async: true,
    crossDomain: true,
    url: "https://6913d16cf34a2ff1170d482e.mockapi.io/tunebox/albuns",
    method: "GET",
  };

  await $.ajax(settings).done(function (response) {
    albuns = response;
  }).fail(function() {
    // Se falhar, usa dados mockados
    albuns = [
      {
        id: 1,
        nome: "Abbey Road",
        artista: "The Beatles",
        genero: "Rock",
        data: "1969-09-26",
        capa: "https://via.placeholder.com/300",
        musicas: [
          { nome: "Come Together", duracao: "4:20" },
          { nome: "Something", duracao: "3:03" },
          { nome: "Maxwell's Silver Hammer", duracao: "3:27" }
        ]
      },
      {
        id: 2,
        nome: "Dark Side of the Moon",
        artista: "Pink Floyd",
        genero: "Progressive Rock",
        data: "1973-03-01",
        capa: "https://via.placeholder.com/300",
        musicas: [
          { nome: "Speak to Me", duracao: "1:30" },
          { nome: "Breathe", duracao: "2:43" },
          { nome: "Time", duracao: "6:53" }
        ]
      }
    ];
  });
}

async function getReviews() {
  const settings = {
    async: true,
    crossDomain: true,
    url: "https://6913d16cf34a2ff1170d482e.mockapi.io/tunebox/reviews",
    method: "GET",
  };

  await $.ajax(settings).done(function (response) {
    reviews = response;
  }).fail(function() {
    // Se falhar, inicializa com array vazio
    reviews = [];
  });
}

function openAlbumModal(album) {
  currentAlbumId = album.id;
  
  // Preenche informações do álbum
  $("#modalTitle").text(album.nome || "Sem título");
  $("#modalArtist").text(`Artista: ${album.artista || "Desconhecido"}`);
  $("#modalGenre").text(`Gênero: ${album.genero || "Não especificado"}`);
  $("#modalDate").text(`Lançamento: ${album.data ? new Date(album.data).toLocaleDateString('pt-BR') : "Não especificado"}`);
  $("#modalCover").attr("src", album.capa || "https://via.placeholder.com/300");
  
  // Preenche lista de músicas
  const songsList = $("#modalSongs");
  songsList.empty();
  
  if (album.musicas && album.musicas.length > 0) {
    album.musicas.forEach((musica, index) => {
      const songItem = $(`
        <li class="song-item">
          <span class="song-number">${index + 1}.</span>
          <span class="song-name">${musica.nome || musica}</span>
          ${musica.duracao ? `<span class="song-duration">${musica.duracao}</span>` : ''}
        </li>
      `);
      songsList.append(songItem);
    });
  } else {
    songsList.append('<li class="song-item">Nenhuma música cadastrada</li>');
  }
  
  // Verifica se existe resenha para este álbum
  const existingReview = reviews.find(r => r.albumId == album.id);
  
  if (existingReview) {
    // Mostra resenha existente
    currentReviewId = existingReview.id;
    displayReview(existingReview);
    $("#editReviewBtn").show();
    $("#newReviewBtn").hide();
    $("#reviewFormModal").hide();
  } else {
    // Mostra botão para criar nova resenha
    currentReviewId = null;
    $("#reviewDisplay").empty();
    $("#editReviewBtn").hide();
    $("#newReviewBtn").show();
    $("#reviewFormModal").hide();
  }
  
  // Abre a modal
  $("#albumModal").fadeIn(300);
}

function displayReview(review) {
  const reviewDisplay = $("#reviewDisplay");
  reviewDisplay.html(`
    <div class="review-content">
      <p class="review-text">${review.texto || review.text || "Sem texto"}</p>
      ${review.data ? `<p class="review-date">${new Date(review.data).toLocaleDateString('pt-BR')}</p>` : ''}
    </div>
  `);
}

function closeModal() {
  $("#albumModal").fadeOut(300);
  currentAlbumId = null;
  currentReviewId = null;
}

// Eventos da modal
$(document).ready(async function () {
  await getAlbuns();
  await getReviews();

  printAlbuns(albuns);
  populateAlbumSelect(albuns);
  
  // Fecha modal ao clicar no X
  $(".modal-close").on('click', function() {
    closeModal();
  });
  
  // Fecha modal ao clicar fora dela
  $(window).on('click', function(event) {
    if ($(event.target).is("#albumModal")) {
      closeModal();
    }
  });
  
  // Botão para escrever nova resenha
  $("#newReviewBtn").on('click', function() {
    $("#reviewFormModal").show();
    $("#reviewText").val("");
    $("#newReviewBtn").hide();
    $("#reviewDisplay").hide();
  });
  
  // Botão para editar resenha existente
  $("#editReviewBtn").on('click', function() {
    const existingReview = reviews.find(r => r.albumId == currentAlbumId);
    if (existingReview) {
      $("#reviewText").val(existingReview.texto || existingReview.text || "");
      $("#reviewFormModal").show();
      $("#editReviewBtn").hide();
      $("#reviewDisplay").hide();
    }
  });
  
  // Botão cancelar
  $("#cancelReview").on('click', function() {
    $("#reviewFormModal").hide();
    if (currentReviewId) {
      const existingReview = reviews.find(r => r.id == currentReviewId);
      if (existingReview) {
        displayReview(existingReview);
        $("#editReviewBtn").show();
      }
    } else {
      $("#newReviewBtn").show();
    }
    $("#reviewDisplay").show();
  });
  
  // Submissão do formulário de resenha
  $("#reviewFormModal").on('submit', async function(e) {
    e.preventDefault();
    
    const reviewText = $("#reviewText").val().trim();
    
    if (!reviewText) {
      alert("Por favor, escreva uma resenha antes de salvar.");
      return;
    }
    
    const reviewData = {
      albumId: currentAlbumId,
      texto: reviewText,
      data: new Date().toISOString()
    };
    
    try {
      if (currentReviewId) {
        // Atualiza resenha existente
        const settings = {
          async: true,
          crossDomain: true,
          url: `https://6913d16cf34a2ff1170d482e.mockapi.io/tunebox/reviews/${currentReviewId}`,
          method: "PUT",
          data: reviewData
        };
        
        await $.ajax(settings).done(function(response) {
          // Atualiza na lista local
          const index = reviews.findIndex(r => r.id == currentReviewId);
          if (index !== -1) {
            reviews[index] = response;
          }
          displayReview(response);
          $("#reviewFormModal").hide();
          $("#editReviewBtn").show();
          $("#reviewDisplay").show();
          alert("Resenha atualizada com sucesso!");
        }).fail(function() {
          // Simula sucesso mesmo se a API falhar
          const index = reviews.findIndex(r => r.id == currentReviewId);
          if (index !== -1) {
            reviews[index] = { ...reviews[index], ...reviewData };
          }
          displayReview(reviewData);
          $("#reviewFormModal").hide();
          $("#editReviewBtn").show();
          $("#reviewDisplay").show();
          alert("Resenha atualizada com sucesso! (simulado)");
        });
      } else {
        // Cria nova resenha
        const settings = {
          async: true,
          crossDomain: true,
          url: "https://6913d16cf34a2ff1170d482e.mockapi.io/tunebox/reviews",
          method: "POST",
          data: reviewData
        };
        
        await $.ajax(settings).done(function(response) {
          reviews.push(response);
          currentReviewId = response.id;
          displayReview(response);
          $("#reviewFormModal").hide();
          $("#editReviewBtn").show();
          $("#newReviewBtn").hide();
          $("#reviewDisplay").show();
          alert("Resenha salva com sucesso!");
        }).fail(function() {
          // Simula criação de resenha mesmo se a API falhar
          const newReview = {
            id: Date.now(),
            ...reviewData
          };
          reviews.push(newReview);
          currentReviewId = newReview.id;
          displayReview(newReview);
          $("#reviewFormModal").hide();
          $("#editReviewBtn").show();
          $("#newReviewBtn").hide();
          $("#reviewDisplay").show();
          alert("Resenha salva com sucesso! (simulado)");
        });
      }
    } catch (error) {
      console.error("Erro ao salvar resenha:", error);
      alert("Erro ao salvar resenha. Tente novamente.");
    }
  });
});

