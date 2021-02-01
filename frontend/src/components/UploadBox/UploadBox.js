import React from 'react';
import { useContext, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Api from '../../Api';
import { userContext } from '../../contexts/userContext';

const UploadBox = () => {
  const UserContext = useContext(userContext);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {}, [isUploading]);

  const onFileChange = (event) => {
    toggleDisableUploads();
    onFileUpload(event.target.files);
  };

  function toggleDisableUploads() {
    setIsUploading((isUploading) => !isUploading);
  }

  const onFileUpload = async (files) => {
    for (var i = 0, j = files.length; i < j; i++) {
      // // Create an object of formData
      const formData = new FormData();
      const file = files[i];

      // Update the formData object
      formData.append('file', file);

      // Details of the uploaded file
      try {
        const result = await Api.task.create(formData);
        console.log(result);
        toggleDisableUploads();
        Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          },
        }).fire({
          icon: 'success',
          title: 'files upload!',
        });
      } catch (error) {
        toggleDisableUploads();
        Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          },
        }).fire({
          icon: 'error',
          title: 'Something went wrong!',
        });
      }
    }
  };

  return (
    <div className='border'>
      <form method='post' action='#' id='#'>
        <div className='form-group files'>
          <input
            type='file'
            name='file'
            className='form-control'
            // multiple
            onChange={onFileChange}
            disabled={isUploading}
          />
        </div>
      </form>
    </div>
  );
};

export default UploadBox;
