const { neon } = require('@neondatabase/serverless');

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('No DATABASE_URL found in build environment.');
    return;
  }

  console.log('Connecting to database to insert invoice...');
  
  try {
    const sql = neon(dbUrl);
    
    // Find the admin user
    const users = await sql`SELECT id FROM users WHERE email = 'silasshaibu2@gmail.com' LIMIT 1`;
    if (users.length === 0) {
      console.error('Admin user silasshaibu2@gmail.com not found!');
      return;
    }
    const userId = users[0].id;
    console.log('Found admin user with ID:', userId);

    // Create client Marco Martinez if not exists
    let client;
    const existingClients = await sql`
      SELECT id FROM clients 
      WHERE user_id = ${userId} AND name = 'Marco Martinez' 
      LIMIT 1
    `;
    
    if (existingClients.length > 0) {
      client = existingClients[0];
      console.log('Found existing client Marco Martinez with ID:', client.id);
    } else {
      const newClients = await sql`
        INSERT INTO clients (user_id, name, email, company, address)
        VALUES (${userId}, 'Marco Martinez', 'marco.martinez@gmail.com', 'Marco Co', 'Modomo Street, Ile-Ife, Nigeria')
        RETURNING id
      `;
      client = newClients[0];
      console.log('Created new client Marco Martinez with ID:', client.id);
    }

    // Check if invoice number 98122 already exists for this user
    const existingInvoices = await sql`
      SELECT id FROM invoices 
      WHERE user_id = ${userId} AND invoice_number = '98122'
      LIMIT 1
    `;

    if (existingInvoices.length > 0) {
      console.log('Invoice number 98122 already exists. Skipping insertion.');
      return;
    }

    // Insert invoice
    const invoiceRows = await sql`
      INSERT INTO invoices (
        user_id, client_id, invoice_number, status, issue_date, due_date, 
        tax_rate, discount, subtotal, tax_amount, total, currency, notes
      )
      VALUES (
        ${userId}, ${client.id}, '98122', 'draft', '2024-12-31', '2025-01-14',
        0, 0, 1020.00, 0, 1020.00, 'USD', 'Order Ref: 2be3ecb93 | Account Ref: Animation'
      )
      RETURNING id
    `;
    const invoiceId = invoiceRows[0].id;
    console.log('Inserted invoice with ID:', invoiceId);

    // Insert line item
    await sql`
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount)
      VALUES (
        ${invoiceId}, 
        'Cardboard Line Project Animation(Rendering-10mins)', 
        1.00, 
        1020.00, 
        1020.00
      )
    `;
    console.log('Inserted invoice line items successfully.');

  } catch (error) {
    console.error('Error inserting invoice:', error);
  }
}

main();
