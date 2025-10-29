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
    import('../lib/utils/consoleMigration').then(({ handleDatabaseError }) => {
      handleDatabaseError(error, 'database_connection_test');
    });
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

    // Check profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) throw profilesError;
    console.log(`Found ${profiles.length} profiles`);

    return {
      categories: categories.length,
      products: products.length,
      profiles: profiles.length,
    };
  } catch (error) {
    import('../lib/utils/consoleMigration').then(({ handleDatabaseError }) => {
      handleDatabaseError(error, 'data_validation');
    });
    throw error;
  }
};