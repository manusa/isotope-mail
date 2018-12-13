import * as applicationService from '../application';
import * as applicationActions from '../../actions/application';

describe('Application service test suite', () => {
  describe('editMessageAsNew', () => {
    test('editMessageAsNew with valid message, should dispatch editMessage', () => {
      // Given
      const dispatch = jest.fn();
      const message = {
        from: ['from@mail.com'],
        recipients: [
          {type: 'To', address: 'to@mail.com'},
          {type: 'Cc', address: 'cc@mail.com'},
          {type: 'Bcc', address: 'bcc@mail.com'}
        ],
        subject: 'This message will be edited as new',
        attachments: [{fileName: 'file.1st', size: 1337, contentType: 'application/octet-stream'}]
      };
      applicationActions.editMessage = jest.fn(editedMessage => {
        expect(editedMessage.to.length).toEqual(1);
        expect(editedMessage.cc.length).toEqual(1);
        expect(editedMessage.bcc.length).toEqual(1);
      });

      // When
      applicationService.editMessageAsNew(dispatch, message);

      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });
  describe('forwardMessage', () => {
    test('forwardMessage with valid message and all recipient types, should dispatch editMessage', () => {
      // Given
      const dispatch = jest.fn();
      const message = {
        from: ['from@mail.com'],
        recipients: [
          {type: 'To', address: 'to@mail.com'},
          {type: 'Cc', address: 'cc@mail.com'},
          {type: 'Bcc', address: 'bcc@mail.com'}
        ],
        subject: 'This message will be forwarded',
        attachments: [{fileName: 'file.1st', size: 1337, contentType: 'application/octet-stream'}]
      };
      applicationActions.editMessage = jest.fn(editedMessage => {
        expect(editedMessage.to.length).toEqual(0);
        expect(editedMessage.cc.length).toEqual(0);
        expect(editedMessage.bcc.length).toEqual(0);
        expect(editedMessage.subject).toEqual(expect.stringMatching(/^Fwd/));
        expect(editedMessage.content).toEqual(expect.stringContaining('forwardAction.To'));
        expect(editedMessage.content).toEqual(expect.stringContaining('forwardAction.Cc'));
        expect(editedMessage.content).toEqual(expect.not.stringContaining('bcc@mail.com'));
      });

      // When
      applicationService.forwardMessage(dispatch, message);

      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
    test('forwardMessage with valid message and no cc recipient types, should dispatch editMessage with no cc', () => {
      // Given
      const dispatch = jest.fn();
      const message = {
        from: ['from@mail.com'],
        recipients: [
          {type: 'To', address: 'to@mail.com'},
          {type: 'Bcc', address: 'bcc@mail.com'}
        ],
        subject: 'This message will be forwarded',
        attachments: [{fileName: 'file.1st', size: 1337, contentType: 'application/octet-stream'}]
      };
      applicationActions.editMessage = jest.fn(editedMessage => {
        expect(editedMessage.subject).toEqual(expect.stringMatching(/^Fwd/));
        expect(editedMessage.content).toEqual(expect.stringContaining('forwardAction.To'));
        expect(editedMessage.content).toEqual(expect.not.stringContaining('forwardAction.Cc'));
        expect(editedMessage.content).toEqual(expect.not.stringContaining('bcc@mail.com'));
      });

      // When
      applicationService.forwardMessage(dispatch, message);

      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });
});
