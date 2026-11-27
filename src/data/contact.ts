// Single source of truth for the studio contact details, so the contact page,
// the structured data and the job listings cannot drift apart.
export const contact = {
  address: '北京市东城区方家胡同46号院E栋306',
  addressEn: 'Room 306, Building E, No. 46 Fangjia Hutong Courtyard,\nDongcheng District, Beijing 100010',
  streetAddress: '方家胡同46号院E栋306',
  addressRegion: '北京市',
  addressLocality: '东城区',
  postalCode: '100010',
  phone: '18511284218',
  phoneHref: 'tel:+8618511284218',
  email: 'beijing@i-space.design',
  mapUrl:
    'https://maps.apple.com/?q=%E5%8C%97%E4%BA%AC%E5%B8%82%E4%B8%9C%E5%9F%8E%E5%8C%BA%E6%96%B9%E5%AE%B6%E8%83%A1%E5%90%8C46%E5%8F%B7%E9%99%A2E%E6%A0%BC%E5%BB%BA306',
} as const;
