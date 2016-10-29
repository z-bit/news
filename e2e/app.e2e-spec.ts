import { ScreenastPage } from './app.po';

describe('screenast App', function() {
  let page: ScreenastPage;

  beforeEach(() => {
    page = new ScreenastPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
