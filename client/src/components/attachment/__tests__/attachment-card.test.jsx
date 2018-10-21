import React from 'react';
import {shallow} from 'enzyme';
import {AttachmentCard} from '..//attachment-card';
import * as messageService from '../../../services/message';

const MOCK_ATTACHMENT = {fileName: 'test-attachment.file', size: 313373};

describe('AttachmentCard component test suite', () => {
  test('Snapshot render, should render attachment card for file', () => {
    const attachmentCard = shallow(<AttachmentCard attachment={MOCK_ATTACHMENT}/>);
    expect(attachmentCard).toMatchSnapshot();
  });
  test('download, not downloading, should trigger download', async () => {
    // Given
    const fetchPromise = Promise.resolve({});
    messageService.downloadAttachment = jest.fn(() => fetchPromise);
    const attachmentCard = shallow(<AttachmentCard attachment={MOCK_ATTACHMENT}/>);

    // When
    attachmentCard.find('.attachment').simulate('click');
    await fetchPromise;
    attachmentCard.update();

    // Then
    expect(messageService.downloadAttachment).toHaveBeenCalledTimes(1);
    expect(attachmentCard.state().downloading).toBe(false);
  });
  test('download, already downloading, should return', async () => {
    // Given
    messageService.downloadAttachment = jest.fn();
    const attachmentCard = shallow(<AttachmentCard attachment={MOCK_ATTACHMENT}/>);
    attachmentCard.setState({downloading: true});
    attachmentCard.update();

    // When
    attachmentCard.find('.attachment').simulate('click');

    // Then
    expect(messageService.downloadAttachment).not.toHaveBeenCalled();
    expect(attachmentCard.state().downloading).toBe(true);
  });
});
