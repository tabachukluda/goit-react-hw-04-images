import React, { useState, useEffect } from 'react';
import { Searchbar } from './Searchbar/Searchbar';
import { fetchImages } from './api/fetchImages';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Button } from './Button/Button';
import { Loader } from './Loader/Loader';
import { Modal } from './Modal/Modal';
import Notiflix from 'notiflix';

export default function App() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const [pageNr, setPageNr] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState('');
  const [modalAlt, setModalAlt] = useState('');
  const [totalHits, setTotalHits] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputForSearch = e.target.elements.inputForSearch;
    const searchValue = inputForSearch.value.trim();

    if (searchValue === '') {
      Notiflix.Notify.info('You cannot search by an empty field, try again.');
      return;
    }

    setIsLoading(true);

    try {
      const { totalHits, imagesData } = await fetchImages(searchValue, 1);

      if (imagesData.length < 1) {
        setImages([]);
        setCurrentSearch(searchValue);
        setPageNr(1);
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        setImages(imagesData);
        setCurrentSearch(searchValue);
        setPageNr(1);
        setTotalHits(totalHits);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      Notiflix.Notify.failure('An error occurred while fetching images.');
    }

    setIsLoading(false);
  };

  const loadMoreImages = async () => {
    setIsLoading(true);

    try {
      const nextPageNr = pageNr + 1;
      const response = await fetchImages(currentSearch, nextPageNr);

      setImages((prevImages) => [...prevImages, ...response.imagesData]);
      setPageNr(nextPageNr);
      setTotalHits(response.totalHits);
    } catch (error) {
      console.error('Error fetching images:', error);
      Notiflix.Notify.failure('An error occurred while fetching images.');
    }

    setIsLoading(false);
  };

  const handleImageClick = (e) => {
    setModalOpen(true);
    setModalAlt(e.target.alt);
    setModalImg(e.target.name);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalImg('');
    setModalAlt('');
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Escape') {
        handleModalClose();
      }
    };

    if (modalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridGap: '16px',
        paddingBottom: '24px',
      }}
    >
      {isLoading ? (
        <Loader />
      ) : (
        <React.Fragment>
          <Searchbar onSubmit={handleSubmit} />
          <ImageGallery onImageClick={handleImageClick} images={images} />
          {images.length < totalHits && <Button onClick={loadMoreImages} />}
        </React.Fragment>
      )}
      {modalOpen && (
        <Modal src={modalImg} alt={modalAlt} handleClose={handleModalClose} />
      )}
    </div>
  );
}