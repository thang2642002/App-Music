/**
    1. render songs 
    2. scroll top 
    3. Play / pause / seek 
    4. CD rotate 
    5. next / prev
    6. random
    7. next / repeat when ended
    8. active song
    9. scroll active song into view
    10. play song when click
 */

const songAPI = "http://localhost:3000/songs";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STRAGE_KEY = "MUCSIC_PLAYER";

const listSong = $(".playlist");
const cd = $(".cd");
const heading = $("header h2");
const cdThurb = $(".cd-thumb");
const audio = $("#audio");
const played = $(".player");
const playBtn = $(".btn-toggle-play");
const progress = $(".progress");
const btnNext = $(".btn-next");
const btnPrev = $(".btn-prev");
const btnRandom = $(".btn-random");
const btnRepeat = $(".btn-repeat");

const app = {
  currenIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STRAGE_KEY)) || {},
  songs: [],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STRAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    fetch(songAPI)
      .then((reponse) => {
        return reponse.json();
      })
      .then((songs) => {
        this.songs = songs;
        const htmls = songs.map((song, index) => {
          return `<div class="song  ${
            index === this.currenIndex ? "active" : ""
          }" data-index = ${index}>
          <div
            class="thumb"
            style="
              background-image: url(${song.image});
            "
          ></div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.author}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>`;
        });

        listSong.innerHTML = htmls.join("");
        this.loadCurrentSong();
      });
  },

  definePropertys: function () {
    Object.defineProperty(this, "currenSong", {
      get: function () {
        return this.songs[this.currenIndex];
      },
    });
  },

  updateActiveSong: function () {
    const songElements = document.querySelectorAll(".song");
    songElements.forEach((songElement, index) => {
      if (index === this.currenIndex) {
        songElement.classList.add("active");
      } else {
        songElement.classList.remove("active");
      }
    });
  },

  handleEvents: function () {
    const _this = this;

    // Xử lý CD quay / dừng
    const cdThurbAnimate = cdThurb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 giây
      iterations: Infinity,
    });
    cdThurbAnimate.pause();

    // Xử lý phóng to / thu nhỏ Cd
    const cdWidth = cd.offsetWidth;
    document.onscroll = function () {
      const scrollTop = window.screenY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi Click Play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi song play
    audio.onplay = function () {
      _this.isPlaying = true;
      played.classList.add("playing");
      cdThurbAnimate.play();
    };
    // Khi xong bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      played.classList.remove("playing");
      cdThurbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Xử lý khi tua song
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // Khi next song
    btnNext.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.updateActiveSong();
      _this.scrollToActiveSong();
    };

    // Khi prev song
    btnPrev.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.updateActiveSong();
      _this.scrollToActiveSong();
    };

    //khi random song
    btnRandom.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      btnRandom.classList.toggle("active", _this.isRandom);
    };

    // Xử lí next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        btnNext.click();
      }
    };

    // Xử lý lặp lại một song
    btnRepeat.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      btnRepeat.classList.toggle("active", _this.isRepeat);
    };

    listSong.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option"))
        if (songNode) {
          //Xử lý click vao song
          _this.currenIndex = parseInt(songNode.dataset.index, 10);
          _this.loadCurrentSong();
          audio.play();
          _this.updateActiveSong();
        }
      // Sử lý vào song option
      if (e.target.closest(".option")) {
        alert("Phần này chưa làm ");
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },

  loadCurrentSong: function () {
    heading.textContent = this.currenSong.name;
    cdThurb.style.backgroundImage = `url('${this.currenSong.image}')`;
    audio.src = this.currenSong.path;
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  nextSong: function () {
    this.currenIndex++;
    if (this.currenIndex >= this.songs.length) {
      this.currenIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currenIndex--;
    if (this.currenIndex < 0) {
      this.currenIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currenIndex);
    this.currenIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    //Gắn cấu hình từ config vào ứng dụng
    this.loadConfig();
    //Định nghĩa các thuộc tính cho Obj
    this.definePropertys();
    //Render playlist
    this.render();
    //Lắng nghe xử lý sự kiện
    this.handleEvents();
    //Hiển thị trang thái ban đầu của btnRandom và btnRepeat
    btnRandom.classList.toggle("active", this.isRandom);
    btnRepeat.classList.toggle("active", this.isRepeat);
  },
};

app.start();
