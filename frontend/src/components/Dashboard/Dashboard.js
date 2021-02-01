import React from 'react';
import UploadBox from '../UploadBox/UploadBox';
import TaskTable from '../TaskTable/TaskTable';

const Dashboard = () => {
  return (
    <div className='container'>
      <center>
        <h1>Image to Text</h1>
      </center>
      <UploadBox />
      <TaskTable />
    </div>
  );
};

export default Dashboard;
