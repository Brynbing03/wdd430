const restaurantSlugs = {
  "McDonald's": 'mcdonalds',
  'Burger King': 'burger-king',
  "Wendy's": 'wendys',
  'Chick-fil-A': 'chick-fil-a',
  'Five Guys': 'five-guys',
  'In-N-Out Burger': 'in-n-out',
  'Shake Shack': 'shake-shack',
  "Arby's": 'arbys',
  Popeyes: 'popeyes',
  'Jack in the Box': 'jack-in-the-box',
  Whataburger: 'whataburger',
  'Sonic Drive-In': 'sonic',
  'Dairy Queen': 'dairy-queen',
  "Culver's": 'culvers',
  "Checkers / Rally's": 'checkers-rallys',
  "Carl's Jr.": 'carls-jr',
  "Raising Cane's": 'raising-canes',
  'Del Taco': 'del-taco',
  KFC: 'kfc',
};

export function getRestaurantSlug(name) {
  return restaurantSlugs[name];
}

export const fries = [
  { name: "World Famous Fries", restaurant: "McDonald's", style: 'Shoestring', score: '4.8', reviews: 0, color: 'gold', imageUrl: '/images/fries/mcdonalds.png' },
  { name: 'French Fries', restaurant: 'Burger King', style: 'Classic cut', score: '4.1', reviews: 0, color: 'red', imageUrl: '/images/fries/burger-king.png' },
  { name: 'Natural-Cut Fries', restaurant: "Wendy's", style: 'Skin-on', score: '4.4', reviews: 0, color: 'red', imageUrl: '/images/fries/wendys.png' },
  { name: 'Waffle Potato Fries', restaurant: "Chick-fil-A", style: 'Waffle', score: '4.6', reviews: 0, color: 'gold', imageUrl: '/images/fries/chick-fil-a.png' },
  { name: 'Five Guys Style Fries', restaurant: 'Five Guys', style: 'Boardwalk', score: '4.7', reviews: 0, color: 'red', imageUrl: '/images/fries/five-guys.png' },
  { name: 'Natural Cut Fries', restaurant: 'In-N-Out Burger', style: 'Fresh cut', score: '3.7', reviews: 0, color: 'gold', imageUrl: '/images/fries/in-n-out.png' },
  { name: 'Crinkle Cut Fries', restaurant: 'Shake Shack', style: 'Crinkle cut', score: '4.3', reviews: 0, color: 'green', imageUrl: '/images/fries/shake-shack.png' },
  { name: 'Curly Fries', restaurant: "Arby's", style: 'Curly', score: '4.5', reviews: 0, color: 'red', imageUrl: '/images/fries/arbys.png' },
  { name: 'Cajun Fries', restaurant: 'Popeyes', style: 'Seasoned', score: '4.2', reviews: 0, color: 'gold', imageUrl: '/images/fries/popeyes.png' },
  { name: 'Natural-Cut Fries', restaurant: 'Jack in the Box', style: 'Classic cut', score: '3.9', reviews: 0, color: 'green', imageUrl: '/images/fries/jack-in-the-box.png' },
  { name: 'French Fries', restaurant: 'Whataburger', style: 'Classic cut', score: '4.0', reviews: 0, color: 'red', imageUrl: '/images/fries/whataburger.png' },
  { name: 'Natural-Cut Fries', restaurant: 'Sonic Drive-In', style: 'Classic cut', score: '3.8', reviews: 0, color: 'gold', imageUrl: '/images/fries/sonic.png' },
  { name: 'Regular Fries', restaurant: 'Dairy Queen', style: 'Classic cut', score: '3.6', reviews: 0, color: 'red', imageUrl: '/images/fries/dairy-queen.png' },
  { name: 'Crinkle Cut Fries', restaurant: "Culver's", style: 'Crinkle cut', score: '4.1', reviews: 0, color: 'green', imageUrl: '/images/fries/culvers.png' },
  { name: 'Famous Seasoned Fries', restaurant: "Checkers / Rally's", style: 'Seasoned', score: '4.6', reviews: 0, color: 'red', imageUrl: '/images/fries/checkers-rallys.png' },
  { name: 'Natural-Cut Fries', restaurant: "Carl's Jr.", style: 'Natural cut', score: '3.8', reviews: 0, color: 'gold', imageUrl: '/images/fries/carls-jr.png' },
  { name: 'Crinkle-Cut Fries', restaurant: "Raising Cane's", style: 'Crinkle cut', score: '4.0', reviews: 0, color: 'green', imageUrl: '/images/fries/raising-canes.png' },
  { name: 'Seasoned Fries', restaurant: 'Del Taco', style: 'Seasoned', score: '3.7', reviews: 0, color: 'gold', imageUrl: '/images/fries/del-taco.png' },
  { name: 'Secret Recipe Fries', restaurant: 'KFC', style: 'Seasoned', score: '3.5', reviews: 0, color: 'red', imageUrl: '/images/fries/kfc.png' },
];
