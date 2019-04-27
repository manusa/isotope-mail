import {compressImage} from '../image';


// THIS APPROACH IS NOT WORKING VVVVVVVVVVVVVVVVVVVVVVVVV
// For images to be loaded in test env we need to add following option to jest configuration in package.json:
// "testEnvironmentOptions": { "resources": "usable" },
// And also have node canvas package installed:
// npm install canvas-prebuilt --save-dev
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('image service test suite', () => {
  describe('compressImage', () => {
    test('valid image, should returned compressed version', async done => {
      // Given
      const emptyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      let imageOnload;
      const drawImage = jest.fn();
      const toDataURL = jest.fn(() => emptyImage);
      jest.spyOn(Image.prototype, 'onload', 'set').mockImplementation(fn => {
        imageOnload = fn;
      });
      HTMLCanvasElement.prototype.getContext = jest.fn(() => ({drawImage}));
      HTMLCanvasElement.prototype.toDataURL = toDataURL;
      global.URL = {
        createObjectURL: jest.fn(blob => {
          expect(blob.type).toBe('image/png');
          return emptyImage;
        }),
        revokeObjectURL: jest.fn()
      };
      const imageBlob = new Blob([''], {type: 'image/png'});
      // When
      const imagePromise = compressImage(imageBlob);
      imageOnload();
      const result = await imagePromise;
      // Then
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toEqual('image/png');
      expect(drawImage).toHaveBeenCalledTimes(1);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
      expect(toDataURL).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
