import React, { useEffect, useState } from 'react';
import { css } from '@emotion/core';
import Api from '../../api';
import Swal from 'sweetalert2';
import PropagateLoader from 'react-spinners/PropagateLoader';

const TaskTable = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const FetchList = async () => {
    try {
      const list = await Api.task.getAll();
      setIsLoading(false);
      setData(list['tasks']);
    } catch (error) {
      console.log('error!');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      FetchList();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [data]);

  const togglePopup = (customer) => {
    Swal.fire({
      title: `Job ID: ${customer.id}`,
      html: `
      <b>Job Name:</b><br/>
      ${customer.job_id}<br/><br/>
      <b>Started:</b> ${customer.created_at}<br/>
      <b>Ended:</b> ${customer.ended_at}<br/><br/>
      <h4>Result</h4>
      ${customer.result}
      `,
      text: `result: ${customer.result}.`,
      isUploading: false,
    });
  };

  return (
    <div className='row'>
      <table className='table table-bordered'>
        <thead className='thead-light'>
          <tr>
            <th scope='col'>ID</th>
            <th scope='col'>Job Name</th>
            <th scope='col'>Status</th>
            <th scope='col'>Queue Time</th>
            <th scope='col'>Finished Time</th>
            <th scope='col'>View</th>
          </tr>
        </thead>
        <tbody>
          <PropagateLoader
            color={'#000000'}
            loading={isLoading}
            css={css`
              position: absolute;
              left: 50%;
              transform: translate(-50%);
              padding: 10px;
            `}
            size={10}
          />
          {data &&
            data.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.job_id}</td>
                <td>{task.status}</td>
                <td>{task.created_at}</td>
                <td>{task.ended_at}</td>
                <td onClick={togglePopup.bind(this, task)}>View</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
