const baseURI = "https://my-json-server.typicode.com/hjacobi1/web1-tunebox/";
let albuns;
let reviews;
let currentAlbumId = null;
let currentReviewId = null;
let selectedStars = 0;
let quickReviewStars = 0;

function printAlbuns(albuns) {
  let container = $("#albunsList");
  container.empty(); // Limpa o container antes de adicionar novos álbuns

  albuns.forEach((album) => {
    let albumCard = $(`
      <div class="album-card" data-album-id="${album.id}">
        <img src="${album.capa}" alt="${
      album.nome
    } Cover" class="album-cover" />
        <h3 class="album-title">${album.nome}</h3>
        <p class="album-artist">${album.artista || "Artista desconhecido"}</p>
        <p class="album-genre">${album.genero || "Gênero não especificado"}</p>
      </div>
    `);

    // Adiciona evento de clique no card do álbum
    albumCard.on("click", function () {
      openAlbumModal(album);
    });

    container.append(albumCard);
  });
}

function populateAlbumSelect(albuns) {
  let select = $("#albumSelect");
  select.empty(); // Limpa o dropdown

  // Adiciona opção padrão
  select.append(
    $("<option>", {
      value: "",
      text: "Selecione um álbum",
    })
  );

  // Adiciona cada álbum como opção
  albuns.forEach((album) => {
    select.append(
      $("<option>", {
        value: album.id,
        text: `${album.nome}${album.artista ? " - " + album.artista : ""}`,
      })
    );
  });
}

async function getAlbuns() {
  const settings = {
    async: true,
    crossDomain: true,
    url: "https://my-json-server.typicode.com/hjacobi1/web1-tunebox/albuns",
    method: "GET",
  };

  await $.ajax(settings)
    .done(function (response) {
      albuns = response;
    })
    .fail(function () {
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
            { nome: "Maxwell's Silver Hammer", duracao: "3:27" },
          ],
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
            { nome: "Time", duracao: "6:53" },
          ],
        },
      ];
    });
}

async function getReviews() {
  const settings = {
    async: true,
    crossDomain: true,
    url: "https://my-json-server.typicode.com/hjacobi1/web1-tunebox/reviews",
    method: "GET",
  };

  await $.ajax(settings)
    .done(function (response) {
      reviews = response;
    })
    .fail(function () {
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
  $("#modalDate").text(
    `Lançamento: ${new Date(album.createdAt).toLocaleDateString("pt-BR")}`
  );
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
          ${
            musica.duracao
              ? `<span class="song-duration">${musica.duracao}</span>`
              : ""
          }
        </li>
      `);
      songsList.append(songItem);
    });
  } else {
    songsList.append('<li class="song-item">Nenhuma música cadastrada</li>');
  }

  // Verifica se existe resenha para este álbum
  const existingReview = reviews.find((r) => r.albumId == album.id);

  if (existingReview) {
    // Mostra resenha existente
    currentReviewId = existingReview.id;
    selectedStars = existingReview.estrelas || existingReview.rating || 0;
    displayReview(existingReview);
    $("#editReviewBtn").show();
    $("#newReviewBtn").hide();
    $("#reviewFormModal").hide();
  } else {
    // Mostra botão para criar nova resenha
    currentReviewId = null;
    selectedStars = 0;
    $("#reviewDisplay").empty();
    $("#editReviewBtn").hide();
    $("#newReviewBtn").show();
    $("#reviewFormModal").hide();
  }

  // Abre a modal
  $("#albumModal").fadeIn(300);
}

function createStarRating(containerId, currentRating = 0, interactive = true) {
  const container = $(containerId);
  container.empty();

  for (let i = 1; i <= 5; i++) {
    const star = $("<span>")
      .addClass("star-rating")
      .html("★")
      .data("rating", i);

    if (i <= currentRating) {
      star.addClass("selected");
    }

    if (interactive) {
      star.on("click", function () {
        selectedStars = $(this).data("rating");
        updateStarRating(containerId, selectedStars);
      });

      star.on("mouseenter", function () {
        const hoverRating = $(this).data("rating");
        updateStarRating(containerId, hoverRating, true);
      });
    }

    container.append(star);
  }

  if (interactive) {
    container.on("mouseleave", function () {
      updateStarRating(containerId, selectedStars);
    });
  }
}

function updateStarRating(containerId, rating, isHover = false) {
  $(containerId + " .star-rating").each(function (index) {
    const starIndex = index + 1;
    $(this).removeClass("active selected");

    if (starIndex <= rating) {
      $(this).addClass(isHover ? "active" : "selected");
    }
  });

  // Atualiza ou cria label
  let label = $(containerId).siblings(".rating-label");
  if (label.length === 0) {
    if (rating > 0) {
      $(containerId).after(
        `<span class="rating-label">${rating} de 5 estrelas</span>`
      );
    }
  } else {
    if (rating > 0) {
      label.text(`${rating} de 5 estrelas`);
    } else {
      label.remove();
    }
  }
}

function displayReview(review) {
  const reviewDisplay = $("#reviewDisplay");
  const rating = review.estrelas || review.rating || 0;

  // Escapa HTML para evitar quebra e preserva quebras de linha

  const reviewText = review.observacoes || "Sem texto";
  const escapedText = $("<div>").text(reviewText).html().replace(/\n/g, "<br>");

  let starsHtml = "";
  if (rating > 0) {
    starsHtml = '<div class="review-stars">';
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<span class="star-rating ${
        i <= rating ? "selected" : ""
      }">★</span>`;
    }
    starsHtml += `</div><p class="rating-text">Avaliação: ${rating} de 5 estrelas</p>`;
  }

  // Formata a data corretamente
  let dateHtml = "";
  if (review.data || review.createdAt) {
    const dateStr = review.createdAt;
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        dateHtml = `<p class="review-date">${date.toLocaleDateString(
          "pt-BR"
        )}</p>`;
      }
    } catch (e) {
      // Ignora erro de data inválida
    }
  }

  reviewDisplay.html(`
    <div class="review-content">
      ${starsHtml}
      <p class="review-text">${escapedText}</p>
      ${dateHtml}
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

  // Inicializa seletor de estrelas no review rápido
  function createQuickReviewStars() {
    const container = $("#starPicker");
    container.empty();

    for (let i = 1; i <= 5; i++) {
      const star = $("<span>")
        .addClass("star-rating")
        .html("★")
        .data("rating", i);

      if (i <= quickReviewStars) {
        star.addClass("selected");
      }

      star.on("click", function () {
        quickReviewStars = $(this).data("rating");
        updateQuickReviewStars();
      });

      star.on("mouseenter", function () {
        const hoverRating = $(this).data("rating");
        updateQuickReviewStars(hoverRating, true);
      });

      container.append(star);
    }

    container.on("mouseleave", function () {
      updateQuickReviewStars();
    });
  }

  function updateQuickReviewStars(rating = quickReviewStars, isHover = false) {
    $("#starPicker .star-rating").each(function (index) {
      const starIndex = index + 1;
      $(this).removeClass("active selected");

      if (starIndex <= rating) {
        $(this).addClass(isHover ? "active" : "selected");
      }
    });

    // Atualiza ou cria label
    let label = $("#starPicker").siblings(".rating-label");
    if (label.length === 0) {
      if (rating > 0 && !isHover) {
        $("#starPicker").after(
          `<span class="rating-label">${rating} de 5 estrelas</span>`
        );
      }
    } else {
      if (rating > 0 && !isHover) {
        label.text(`${rating} de 5 estrelas`);
      } else if (rating === 0 && !isHover) {
        label.remove();
      }
    }
  }

  createQuickReviewStars();

  // Função para atualizar modal se estiver aberta para o álbum
  function updateModalIfOpen(albumId, review) {
    if (currentAlbumId == albumId && $("#albumModal").is(":visible")) {
      // Atualiza a exibição da review na modal
      currentReviewId = review.id;
      selectedStars = review.estrelas || review.rating || 0;
      displayReview(review);
      $("#editReviewBtn").show();
      $("#newReviewBtn").hide();
      $("#reviewFormModal").hide();
      $("#reviewDisplay").show();
    }
  }

  // Função para resetar formulário de review rápido
  function resetQuickReviewForm() {
    $("#albumSelect").val("");
    $("#obs").val("");
    quickReviewStars = 0;
    createQuickReviewStars();
  }

  // Submissão do formulário de review rápido
  $("#reviewForm").on("submit", async function (e) {
    e.preventDefault();

    const albumId = $("#albumSelect").val();
    const reviewText = $("#obs").val().trim();

    if (!albumId) {
      alert("Por favor, selecione um álbum.");
      return;
    }

    if (!reviewText && quickReviewStars === 0) {
      alert(
        "Por favor, escreva uma observação ou selecione uma avaliação com estrelas."
      );
      return;
    }

    const reviewData = {
      albumId: albumId,
      observacoes: reviewText || "",
      estrelas: quickReviewStars,
      rating: quickReviewStars,
      data: new Date().toISOString(),
    };

    // Verifica se já existe review para este álbum
    const existingReviewIndex = reviews.findIndex((r) => r.albumId == albumId);

    try {
      if (existingReviewIndex !== -1) {
        // Atualiza review existente
        const existingReview = reviews[existingReviewIndex];
        currentReviewId = existingReview.id;

        const settings = {
          async: true,
          crossDomain: true,
          url: `https://my-json-server.typicode.com/hjacobi1/web1-tunebox/reviews/${currentReviewId}`,
          method: "PUT",
          data: reviewData,
        };

        await $.ajax(settings)
          .done(function (response) {
            reviews[existingReviewIndex] = response;
            updateModalIfOpen(albumId, response);

            resetQuickReviewForm();
          })
          .fail(function () {
            // Simula atualização
            reviews[existingReviewIndex] = { ...existingReview, ...reviewData };
            updateModalIfOpen(albumId, reviews[existingReviewIndex]);

            resetQuickReviewForm();
          });
      } else {
        // Cria nova review
        const settings = {
          async: true,
          crossDomain: true,
          url: "https://my-json-server.typicode.com/hjacobi1/web1-tunebox/reviews",
          method: "POST",
          data: reviewData,
        };

        await $.ajax(settings)
          .done(function (response) {
            reviews.push(response);
            updateModalIfOpen(albumId, response);

            resetQuickReviewForm();
          })
          .fail(function () {
            // Simula criação
            const newReview = {
              id: Date.now(),
              ...reviewData,
            };
            reviews.push(newReview);
            updateModalIfOpen(albumId, newReview);

            resetQuickReviewForm();
          });
      }
    } catch (error) {
      console.error("Erro ao salvar review:", error);
    }
  });

  // Função para atualizar modal se estiver aberta para o álbum
  function updateModalIfOpen(albumId, review) {
    // Compara IDs convertendo ambos para string para garantir compatibilidade
    if (
      String(currentAlbumId) === String(albumId) &&
      $("#albumModal").is(":visible")
    ) {
      // Atualiza a exibição da review na modal
      currentReviewId = review.id;
      selectedStars = review.estrelas || review.rating || 0;
      displayReview(review);
      $("#editReviewBtn").show();
      $("#newReviewBtn").hide();
      $("#reviewFormModal").hide();
      $("#reviewDisplay").show();
    }
  }

  // Função para resetar formulário de review rápido
  function resetQuickReviewForm() {
    $("#albumSelect").val("");
    $("#obs").val("");
    quickReviewStars = 0;
    createQuickReviewStars();
  }

  // Botão limpar review rápido
  $("#resetReview").on("click", function () {
    resetQuickReviewForm();
  });

  // Handler para adicionar música ao formulário de álbum
  let songCount = 0;
  $("#addSongBtn").on("click", function () {
    songCount++;
    const songDiv = $(`
      <div class="song-input-item" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
        <input type="text" class="song-name-input" placeholder="Nome da música" style="flex: 1;" />
        <input type="text" class="song-duration-input" placeholder="Duração (ex: 3:45)" style="width: 100px;" />
        <button type="button" class="btn-remove-song" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Remover</button>
      </div>
    `);

    songDiv.find(".btn-remove-song").on("click", function () {
      songDiv.remove();
    });

    $("#songsContainer").append(songDiv);
  });

  // Handler para preview da capa
  $("#capa").on("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#capaPreview").html(
          `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-top: 8px;" />`
        );
      };
      reader.readAsDataURL(file);
    }
  });

  // Submissão do formulário de álbum
  $("#albumForm").on("submit", async function (e) {
    e.preventDefault();

    const nome = $("#nome").val().trim();
    const data = $("#data").val();
    const artista = $("#artista").val().trim();
    const genero = $("#genero").val().trim();
    const capaFile = $("#capa")[0].files[0];

    if (!nome) {
      alert("Por favor, preencha o título do álbum.");
      return;
    }

    // Coleta músicas
    const musicas = [];
    $("#songsContainer .song-input-item").each(function () {
      const nomeMusica = $(this).find(".song-name-input").val().trim();
      const duracao = $(this).find(".song-duration-input").val().trim();
      if (nomeMusica) {
        musicas.push({
          nome: nomeMusica,
          duracao: duracao || null,
        });
      }
    });

    // Processa capa
    if (capaFile) {
      // Converte para base64 para armazenamento local
      const reader = new FileReader();
      reader.onload = function (e) {
        const capaUrl = e.target.result;
        saveAlbum(nome, data, artista, genero, capaUrl, musicas);
      };
      reader.readAsDataURL(capaFile);
    } else {
      saveAlbum(nome, data, artista, genero, "", musicas);
    }
  });

  // Função para salvar álbum
  async function saveAlbum(nome, data, artista, genero, capaUrl, musicas) {
    const newAlbum = {
      nome: nome,
      data: data || null,
      artista: artista || null,
      genero: genero || null,
      capa: capaUrl || "https://via.placeholder.com/300",
      musicas: musicas,
      createdAt: new Date().toISOString(),
    };

    try {
      // Tenta salvar na API
      const settings = {
        async: true,
        crossDomain: true,
        url: "https://my-json-server.typicode.com/hjacobi1/web1-tunebox/albuns",
        method: "POST",
        data: newAlbum,
      };

      await $.ajax(settings)
        .done(function (response) {
          // Adiciona ID retornado pela API
          newAlbum.id = response.id || Date.now();
          albuns.push(newAlbum);
          updateAlbumsDisplay();

          resetAlbumForm();
        })
        .fail(function () {
          // Simula salvamento local
          newAlbum.id = Date.now();
          albuns.push(newAlbum);
          updateAlbumsDisplay();

          resetAlbumForm();
        });
    } catch (error) {
      console.error("Erro ao salvar álbum:", error);
      // Salva localmente mesmo em caso de erro
      newAlbum.id = Date.now();
      albuns.push(newAlbum);
      updateAlbumsDisplay();

      resetAlbumForm();
    }
  }

  // Função para atualizar exibição de álbuns
  function updateAlbumsDisplay() {
    printAlbuns(albuns);
    populateAlbumSelect(albuns);
  }

  // Função para resetar formulário de álbum
  function resetAlbumForm() {
    $("#albumForm")[0].reset();
    $("#songsContainer").empty();
    $("#capaPreview").empty();
    songCount = 0;
  }

  // Botão limpar álbum
  $("#resetAlbum").on("click", function () {
    resetAlbumForm();
  });

  // Fecha modal ao clicar no X
  $(".modal-close").on("click", function () {
    closeModal();
  });

  // Fecha modal ao clicar fora dela
  $(window).on("click", function (event) {
    if ($(event.target).is("#albumModal")) {
      closeModal();
    }
  });

  // Botão para escrever nova resenha
  $("#newReviewBtn").on("click", function () {
    selectedStars = 0;
    createStarRating("#modalStarPicker", 0, true);
    $("#reviewFormModal").show();
    $("#reviewText").val("");
    $("#newReviewBtn").hide();
    $("#reviewDisplay").hide();
  });

  // Botão para editar resenha existente
  $("#editReviewBtn").on("click", function () {
    const existingReview = reviews.find((r) => r.albumId == currentAlbumId);
    if (existingReview) {
      selectedStars = existingReview.estrelas || existingReview.rating || 0;
      createStarRating("#modalStarPicker", selectedStars, true);
      $("#reviewText").val(existingReview.texto || existingReview.text || "");
      $("#reviewFormModal").show();
      $("#editReviewBtn").hide();
      $("#reviewDisplay").hide();
    }
  });

  // Botão cancelar
  $("#cancelReview").on("click", function () {
    $("#reviewFormModal").hide();
    if (currentReviewId) {
      const existingReview = reviews.find((r) => r.id == currentReviewId);
      if (existingReview) {
        selectedStars = existingReview.estrelas || existingReview.rating || 0;
        displayReview(existingReview);
        $("#editReviewBtn").show();
      }
    } else {
      selectedStars = 0;
      $("#newReviewBtn").show();
    }
    $("#reviewDisplay").show();
  });

  // Submissão do formulário de resenha
  $("#reviewFormModal").on("submit", async function (e) {
    e.preventDefault();

    const reviewText = $("#reviewText").val().trim();

    if (!reviewText) {
      alert("Por favor, escreva uma resenha antes de salvar.");
      return;
    }

    const reviewData = {
      albumId: currentAlbumId,
      observacoes: reviewText,
      estrelas: selectedStars,
      rating: selectedStars, // Compatibilidade
      data: new Date().toISOString(),
    };

    try {
      if (currentReviewId) {
        // Atualiza resenha existente
        const settings = {
          async: true,
          crossDomain: true,
          url: `https://my-json-server.typicode.com/hjacobi1/web1-tunebox/reviews/${currentReviewId}`,
          method: "PUT",
          data: reviewData,
        };

        await $.ajax(settings)
          .done(function (response) {
            // Atualiza na lista local
            const index = reviews.findIndex((r) => r.id == currentReviewId);
            if (index !== -1) {
              // Garante que todos os campos necessários estejam presentes
              const updatedReview = {
                ...reviewData,
                ...response,
                id: currentReviewId,
                estrelas: response.estrelas || reviewData.estrelas || 0,
                rating:
                  response.rating ||
                  reviewData.rating ||
                  response.estrelas ||
                  reviewData.estrelas ||
                  0,
                texto:
                  response.texto ||
                  reviewData.texto ||
                  response.text ||
                  reviewData.text ||
                  "",
              };
              reviews[index] = updatedReview;
              selectedStars =
                updatedReview.estrelas || updatedReview.rating || 0;
              displayReview(updatedReview);
            }
            $("#reviewFormModal").hide();
            $("#editReviewBtn").show();
            $("#reviewDisplay").show();
          })
          .fail(function () {
            // Simula sucesso mesmo se a API falhar
            const index = reviews.findIndex((r) => r.id == currentReviewId);
            if (index !== -1) {
              // Preserva o ID e outros campos existentes
              const updatedReview = {
                ...reviews[index],
                ...reviewData,
                id: currentReviewId, // Garante que o ID seja preservado
              };
              reviews[index] = updatedReview;
              selectedStars = reviewData.estrelas || 0;
              displayReview(updatedReview);
            }
            $("#reviewFormModal").hide();
            $("#editReviewBtn").show();
            $("#reviewDisplay").show();
          });
      } else {
        // Cria nova resenha
        const settings = {
          async: true,
          crossDomain: true,
          url: "https://my-json-server.typicode.com/hjacobi1/web1-tunebox/reviews",
          method: "POST",
          data: reviewData,
        };

        await $.ajax(settings)
          .done(function (response) {
            reviews.push(response);
            currentReviewId = response.id;
            selectedStars = response.estrelas || response.rating || 0;
            displayReview(response);
            $("#reviewFormModal").hide();
            $("#editReviewBtn").show();
            $("#newReviewBtn").hide();
            $("#reviewDisplay").show();
          })
          .fail(function () {
            // Simula criação de resenha mesmo se a API falhar
            const newReview = {
              id: Date.now(),
              ...reviewData,
            };
            reviews.push(newReview);
            currentReviewId = newReview.id;
            selectedStars = newReview.estrelas || 0;
            displayReview(newReview);
            $("#reviewFormModal").hide();
            $("#editReviewBtn").show();
            $("#newReviewBtn").hide();
            $("#reviewDisplay").show();
          });
      }
    } catch (error) {
      console.error("Erro ao salvar resenha:", error);
    }
  });
});
