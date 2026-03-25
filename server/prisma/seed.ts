import { PrismaClient, UserRole, VehicleStatus, FuelType, Transmission, SaleStatus, AppointmentType, AppointmentStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (in reverse dependency order)
  await prisma.activityLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // --- USERS ---
  const saltRounds = 12;
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@autodeal.lk',
        passwordHash: await bcrypt.hash('Admin@123', saltRounds),
        role: UserRole.ADMIN,
        firstName: 'Kamal',
        lastName: 'Perera',
        phone: '+94771234567',
      },
    }),
    prisma.user.create({
      data: {
        email: 'manager@autodeal.lk',
        passwordHash: await bcrypt.hash('Manager@123', saltRounds),
        role: UserRole.MANAGER,
        firstName: 'Nimal',
        lastName: 'Fernando',
        phone: '+94772345678',
      },
    }),
    prisma.user.create({
      data: {
        email: 'agent1@autodeal.lk',
        passwordHash: await bcrypt.hash('Agent@123', saltRounds),
        role: UserRole.SALES_AGENT,
        firstName: 'Supun',
        lastName: 'Silva',
        phone: '+94773456789',
      },
    }),
    prisma.user.create({
      data: {
        email: 'inventory@autodeal.lk',
        passwordHash: await bcrypt.hash('Inventory@123', saltRounds),
        role: UserRole.INVENTORY_STAFF,
        firstName: 'Chamari',
        lastName: 'Jayawardena',
        phone: '+94774567890',
      },
    }),
  ]);

  const [admin, manager, agent, inventory] = users;
  console.log(`✅ Created ${users.length} users`);

  // --- VEHICLES ---
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        make: 'Toyota', brand: 'Corolla', model: 'GLi', year: 2023,
        vin: 'JTDKN3DU5P0123456', colour: 'Pearl White', mileage: 15000,
        fuelType: FuelType.PETROL, transmission: Transmission.AUTOMATIC,
        price: 12500000, status: VehicleStatus.AVAILABLE,
        description: 'Well-maintained sedan, single owner, full service history.',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Toyota', brand: 'Camry', model: 'V6', year: 2024,
        vin: 'JTDKN3DU5P0234567', colour: 'Midnight Black', mileage: 5000,
        fuelType: FuelType.HYBRID, transmission: Transmission.AUTOMATIC,
        price: 18500000, status: VehicleStatus.AVAILABLE,
        description: 'Latest model hybrid with premium features.',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Honda', brand: 'Civic', model: 'RS', year: 2022,
        vin: 'HHGCV1F34NA012345', colour: 'Rallye Red', mileage: 28000,
        fuelType: FuelType.PETROL, transmission: Transmission.AUTOMATIC,
        price: 9800000, status: VehicleStatus.RESERVED,
        description: 'Sporty sedan with turbo engine.',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Honda', brand: 'Vezel', model: 'Z', year: 2023,
        vin: 'HHGCV1F34NA023456', colour: 'Crystal Blue', mileage: 12000,
        fuelType: FuelType.HYBRID, transmission: Transmission.AUTOMATIC,
        price: 14200000, status: VehicleStatus.AVAILABLE,
        description: 'Compact SUV with excellent fuel economy.',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Nissan', brand: 'X-Trail', model: 'Ti', year: 2024,
        vin: 'JN8AT3MT9PW012345', colour: 'Gun Metallic', mileage: 3000,
        fuelType: FuelType.PETROL, transmission: Transmission.AUTOMATIC,
        price: 22000000, status: VehicleStatus.AVAILABLE,
        description: 'Brand new SUV with 7 seats and panoramic roof.',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Suzuki', brand: 'Swift', model: 'RS', year: 2023,
        vin: 'JSAFNB13SVA012345', colour: 'Flame Orange', mileage: 8000,
        fuelType: FuelType.PETROL, transmission: Transmission.MANUAL,
        price: 6500000, status: VehicleStatus.AVAILABLE,
        description: 'Fun to drive hatchback, great on fuel.',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Toyota', brand: 'Aqua', model: 'G', year: 2021,
        vin: 'JTDKN3DU5P0345678', colour: 'Silver Metallic', mileage: 45000,
        fuelType: FuelType.HYBRID, transmission: Transmission.AUTOMATIC,
        price: 7200000, status: VehicleStatus.SOLD,
        description: 'Economical hybrid hatchback.',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Nissan', brand: 'Leaf', model: 'e+', year: 2023,
        vin: 'JN1BAZE12U0012345', colour: 'Aurora Green', mileage: 10000,
        fuelType: FuelType.ELECTRIC, transmission: Transmission.AUTOMATIC,
        price: 11000000, status: VehicleStatus.AVAILABLE,
        description: 'Full electric with 300km range.',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Toyota', brand: 'Hilux', model: 'Revo', year: 2024,
        vin: 'JTFHT02PXP0012345', colour: 'Super White', mileage: 1500,
        fuelType: FuelType.DIESEL, transmission: Transmission.AUTOMATIC,
        price: 25000000, status: VehicleStatus.AVAILABLE,
        description: 'Double cab pickup, brand new condition.',
      },
    }),
    prisma.vehicle.create({
      data: {
        make: 'Suzuki', brand: 'Alto', model: 'K10', year: 2020,
        vin: 'JSAFNB13SVA023456', colour: 'Cerulean Blue', mileage: 52000,
        fuelType: FuelType.PETROL, transmission: Transmission.MANUAL,
        price: 3800000, status: VehicleStatus.AVAILABLE,
        description: 'Budget-friendly city car, low running costs.',
      },
    }),
  ]);

  console.log(`✅ Created ${vehicles.length} vehicles`);

  // --- CUSTOMERS ---
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        firstName: 'Dinesh', lastName: 'Wijesinghe',
        email: 'dinesh.w@gmail.com', phone: '+94775678901',
        address: '42 Galle Road, Colombo 03', notes: 'Interested in SUVs',
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Sachini', lastName: 'Bandara',
        email: 'sachini.b@gmail.com', phone: '+94776789012',
        address: '15 Kandy Road, Kadawatha', notes: 'Looking for hybrid vehicles',
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Ruwan', lastName: 'Wickramasinghe',
        email: 'ruwan.w@yahoo.com', phone: '+94777890123',
        address: '8 Temple Road, Nugegoda', notes: 'Budget range 5-10M',
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Malini', lastName: 'Senanayake',
        email: 'malini.s@outlook.com', phone: '+94778901234',
        address: '23 High Level Road, Maharagama',
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Tharaka', lastName: 'Gunawardena',
        email: 'tharaka.g@gmail.com', phone: '+94779012345',
        address: '56 Negombo Road, Wattala', notes: 'First time buyer',
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // --- SALES ---
  const sales = await Promise.all([
    prisma.sale.create({
      data: {
        vehicleId: vehicles[6]!.id, // Toyota Aqua (SOLD)
        customerId: customers[2]!.id, // Ruwan
        agentId: agent!.id,
        salePrice: 7000000,
        saleDate: new Date('2026-02-15'),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: SaleStatus.COMPLETED,
      },
    }),
    prisma.sale.create({
      data: {
        vehicleId: vehicles[2]!.id, // Honda Civic (RESERVED)
        customerId: customers[0]!.id, // Dinesh
        agentId: agent!.id,
        salePrice: 9500000,
        saleDate: new Date('2026-03-20'),
        paymentMethod: PaymentMethod.FINANCE,
        status: SaleStatus.NEGOTIATION,
      },
    }),
    prisma.sale.create({
      data: {
        vehicleId: vehicles[4]!.id, // Nissan X-Trail
        customerId: customers[3]!.id, // Malini
        agentId: agent!.id,
        salePrice: 21500000,
        saleDate: new Date('2026-03-22'),
        paymentMethod: PaymentMethod.CASH,
        status: SaleStatus.PENDING,
      },
    }),
  ]);

  console.log(`✅ Created ${sales.length} sales`);

  // --- INVOICES (for completed sales) ---
  const completedSale = sales[0]!;
  await prisma.invoice.create({
    data: {
      saleId: completedSale.id,
      amount: completedSale.salePrice,
      tax: Number(completedSale.salePrice) * 0.12,
      total: Number(completedSale.salePrice) * 1.12,
      issuedDate: completedSale.saleDate,
      paymentStatus: 'PAID',
    },
  });

  console.log('✅ Created 1 invoice');

  // --- APPOINTMENTS ---
  await Promise.all([
    prisma.appointment.create({
      data: {
        customerId: customers[1]!.id, // Sachini
        vehicleId: vehicles[3]!.id, // Honda Vezel
        agentId: agent!.id,
        type: AppointmentType.TEST_DRIVE,
        dateTime: new Date('2026-03-28T10:00:00'),
        status: AppointmentStatus.SCHEDULED,
        notes: 'Customer interested in hybrid features',
      },
    }),
    prisma.appointment.create({
      data: {
        customerId: customers[4]!.id, // Tharaka
        vehicleId: vehicles[5]!.id, // Suzuki Swift
        agentId: agent!.id,
        type: AppointmentType.TEST_DRIVE,
        dateTime: new Date('2026-03-29T14:00:00'),
        status: AppointmentStatus.SCHEDULED,
      },
    }),
    prisma.appointment.create({
      data: {
        customerId: customers[0]!.id, // Dinesh
        agentId: agent!.id,
        type: AppointmentType.CONSULTATION,
        dateTime: new Date('2026-03-27T11:00:00'),
        status: AppointmentStatus.SCHEDULED,
        notes: 'Discuss financing options for Honda Civic',
      },
    }),
    prisma.appointment.create({
      data: {
        customerId: customers[2]!.id, // Ruwan
        vehicleId: vehicles[7]!.id, // Nissan Leaf
        agentId: agent!.id,
        type: AppointmentType.TEST_DRIVE,
        dateTime: new Date('2026-03-30T09:00:00'),
        status: AppointmentStatus.SCHEDULED,
        notes: 'Wants to test electric vehicle',
      },
    }),
  ]);

  console.log('✅ Created 4 appointments');
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
