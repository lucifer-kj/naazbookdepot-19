import { supabase } from '../lib/supabase';

export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count()')
      .single();

    if (error) {
      throw error;
    }

    console.log('Database connection successful!');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

export const validateData = async () => {
  try {
    // Check categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) throw categoriesError;
    console.log(`Found ${categories.length} categories`);

    // Check products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) throw productsError;
    console.log(`Found ${products.length} products`);

    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) throw usersError;
    console.log(`Found ${users.length} users`);

    return {
      categories: categories.length,
      products: products.length,
      users: users.length,
    };
  } catch (error) {
    console.error('Data validation failed:', error);
    throw error;
  }
};