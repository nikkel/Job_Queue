import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Backend from './backend';

Enzyme.configure({ adapter: new Adapter() });

describe('Backend Integration Tests Functionality', () => {
  test('Get API method', async () => {
    const result = await Backend.get('/');
    console.log(result);
    expect(result).toEqual('Get is working!');
  });

  test('Delete API method', async () => {
    const result = await Backend.delete('/');
    console.log(result);
    expect(result).toEqual('Delete is working!');
  });

  test('Post API method', async () => {
    const result = await Backend.post('/');
    console.log(result);
    expect(result).toEqual('Post is working!');
  });

  test('Put API method', async () => {
    const result = await Backend.put('/');
    console.log(result);
    expect(result).toEqual('Put is working!');
  });

  test('Patch API method', async () => {
    const result = await Backend.patch('/');
    console.log(result);
    expect(result).toEqual('Patch is working!');
  });
});
