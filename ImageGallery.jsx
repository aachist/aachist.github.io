function ImageGallery() {
  // Список ваших изображений
  const images = [
    { src: "img/engraving_1.png", thumb: "img/engraving_1.png", subHtml: "<h4>Гравюра I</h4>" },
    { src: "img/engraving_2.png", thumb: "img/engraving_2.png", subHtml: "<h4>Гравюра II</h4>" },
    { src: "img/engraving_3.png", thumb: "img/engraving_3.png", subHtml: "<h4>Гравюра III</h4>" },
    { src: "img/engraving_4.png", thumb: "img/engraving_4.png", subHtml: "<h4>Гравюра IV</h4>" },
    { src: "img/engraving_5.png", thumb: "img/engraving_5.png", subHtml: "<h4>Гравюра V</h4>" },
    { src: "img/user_photo.jpg", thumb: "img/user_photo.jpg", subHtml: "<h4>Фото пользователя</h4>" }
  ];

  // React.useEffect используется для того, чтобы запустить код lightGallery
  // только после того, как HTML-элементы галереи будут созданы на странице.
  React.useEffect(() => {
    const galleryContainer = document.getElementById('lightgallery');
    if (galleryContainer) {
      const lg = lightGallery(galleryContainer, {
        plugins: [lgZoom], // Активируем плагин зума
        speed: 500,
        licenseKey: '0000-0000-000-0000', // Ключ для бесплатного использования
        mousewheel: true, // Включаем масштабирование колесиком мыши
        download: false // Отключаем кнопку скачивания для чистоты интерфейса
      });

      // Эта функция нужна для очистки ресурсов, когда компонент исчезает со страницы
      return () => {
        lg.destroy();
      };
    }
  }, []); // [] означает, что этот код выполнится только один раз

  return (
    <div className="gallery-container p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Галерея</h2>
      <div id="lightgallery" className="flex flex-wrap justify-center gap-4">
        {images.map((image, index) => (
          <a 
            href={image.src} 
            key={index} 
            className="img-card block w-48 h-48"
            data-sub-html={image.subHtml} // Добавляем подпись к изображению
          >
            <img 
              alt={`thumbnail ${index + 1}`} 
              src={image.thumb} 
              className="w-full h-full object-cover" 
            />
          </a>
        ))}
      </div>
    </div>
  );
}
