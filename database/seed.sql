-- =======================================================
-- DATOS DE PRUEBA (50 registros por tabla)
-- =======================================================

-- 1. INSERTAR 50 CATEGORÍAS
INSERT INTO product_category (name, description) VALUES
('Computadoras', 'Laptops y equipos de escritorio'),
('Periféricos', 'Teclados, ratones y accesorios'),
('Monitores', 'Pantallas de alta resolución'),
('Componentes', 'Partes internas de PC'),
('Almacenamiento', 'Discos duros y SSDs'),
('Redes', 'Routers y adaptadores de red'),
('Software y Licencias', 'Suscripciones y programas'),
('Literatura Académica', 'Libros de texto y consulta'),
('Mitología y Filosofía', 'Libros clásicos y existencialismo'),
('Mobiliario', 'Sillas y escritorios ergonómicos'),
('Audio', 'Audífonos y altavoces'),
('Cables y Adaptadores', 'Conectividad general'),
('Mochilas', 'Transporte de equipo'),
('Servicios Cloud', 'Hosting y bases de datos'),
('Merchandise', 'Figuras y coleccionables'),
('Energía', 'UPS y regletas'),
('Impresoras', 'Equipos de impresión y escáneres'),
('Consumibles', 'Cartuchos y papel'),
('Tablets', 'Dispositivos móviles'),
('Smartphones', 'Teléfonos celulares'),
('Cámaras', 'Webcams y equipo fotográfico'),
('Microcontroladores', 'Placas de desarrollo IoT'),
('Sensores', 'Componentes para electrónica'),
('Herramientas', 'Kits de reparación de PC'),
('Iluminación', 'Luces de escritorio y aros de luz'),
('Soportes', 'Brazos para monitores'),
('Ventilación', 'Coolers y pasta térmica'),
('Gaming', 'Accesorios para jugadores'),
('Bolsos', 'Fundas para laptops'),
('Tarjetas de Video', 'GPUs para desarrollo y diseño'),
('Placas Base', 'Motherboards de varias gamas'),
('Procesadores', 'CPUs de última generación'),
('Memorias RAM', 'Módulos DDR4 y DDR5'),
('Fuentes de Poder', 'PSUs certificadas'),
('Gabinetes', 'Chasis para PC'),
('Tarjetas de Sonido', 'Interfaces de audio'),
('Discos Externos', 'Almacenamiento portátil'),
('Memorias USB', 'Pendrives de varias capacidades'),
('Hubs USB', 'Expansores de puertos'),
('Antenas WiFi', 'Receptores inalámbricos'),
('Cables HDMI', 'Transmisión de video'),
('Cables Ethernet', 'Conexiones de red Cat6/Cat7'),
('Baterías Portátiles', 'Powerbanks'),
('Lentes VR', 'Realidad virtual'),
('Drones', 'Vehículos aéreos no tripulados'),
('Pizarras', 'Para diagramación y estudio'),
('Marcadores', 'Accesorios de oficina'),
('Cuadernos', 'Apuntes universitarios'),
('Calculadoras', 'Científicas y graficadoras'),
('Termos', 'Contenedores para bebidas');

-- 2. INSERTAR 50 PROVEEDORES
INSERT INTO supplier (name, email, phone) VALUES
('TechCorp Guatemala', 'ventas@techcorp.gt', '2233-4455'),
('Distribuidora El Valle', 'contacto@elvalle.com.gt', '2456-7890'),
('Global Software Inc.', 'licenses@globalsoft.com', '1-800-555-0199'),
('Librería Atenas', 'pedidos@atenas.gt', '2222-1111'),
('Importaciones Zeta', 'info@zetaimports.com', '2333-2222'),
('Cloud Services Latam', 'soporte@cloudlatam.net', '2444-3333'),
('ElectroMundo', 'ventas@electromundo.gt', '2555-4444'),
('Accesorios Universitarios', 'contacto@accesoriosuvg.com', '2666-5555'),
('IoT Solutions', 'sales@iotsolutions.io', '2777-6666'),
('Muebles Ergo', 'ventas@ergo.com.gt', '2888-7777'),
('AudioPro', 'info@audiopro.gt', '2999-8888'),
('Cables y Más', 'pedidos@cablesymas.com', '2111-9999'),
('Impresiones Rápidas', 'contacto@impresiones.gt', '2222-0000'),
('Suministros Oficina', 'ventas@oficina.com.gt', '2333-1111'),
('Móviles GT', 'info@moviles.gt', '2444-2222'),
('Cámaras Profesionales', 'ventas@camaras.com', '2555-3333'),
('Componentes Electrónicos', 'pedidos@componentes.gt', '2666-4444'),
('Herramientas Precisión', 'contacto@herramientas.com', '2777-5555'),
('Iluminación LED', 'ventas@led.gt', '2888-6666'),
('Soportes Universales', 'info@soportes.com', '2999-7777'),
('Cooling Systems', 'pedidos@cooling.gt', '2111-8888'),
('GamerZone', 'contacto@gamerzone.com', '2222-9999'),
('Fundas y Protectores', 'ventas@fundas.gt', '2333-0000'),
('Distribuidora GPUs', 'info@gpus.com', '2444-1111'),
('Motherboards Central', 'pedidos@motherboards.gt', '2555-2222'),
('CPUs Direct', 'contacto@cpus.com', '2666-3333'),
('RAM Express', 'ventas@ram.gt', '2777-4444'),
('Power Supplies SA', 'info@power.com', '2888-5555'),
('Casings Guatemala', 'pedidos@casings.gt', '2999-6666'),
('Audio Interfaces', 'contacto@audiointerfaces.com', '2111-7777'),
('Almacenamiento Externo', 'ventas@externo.gt', '2222-8888'),
('USBs al por mayor', 'info@usbs.com', '2333-9999'),
('Hubs y Conexiones', 'pedidos@hubs.gt', '2444-0000'),
('Redes Inalámbricas', 'contacto@redes.com', '2555-1111'),
('Video HD', 'ventas@videohd.gt', '2666-2222'),
('Ethernet Pro', 'info@ethernet.com', '2777-3333'),
('Baterías y Energía', 'pedidos@baterias.gt', '2888-4444'),
('VR Latam', 'contacto@vrlatam.com', '2999-5555'),
('Drones Guatemala', 'ventas@drones.gt', '2111-6666'),
('Pizarras Acrílicas', 'info@pizarras.com', '2222-7777'),
('Marcadores y Útiles', 'pedidos@marcadores.gt', '2333-8888'),
('Papelería Universitaria', 'contacto@papeleria.com', '2444-9999'),
('Calculadoras Científicas', 'ventas@calculadoras.gt', '2555-0000'),
('Termos y Pachones', 'info@termos.com', '2666-1111'),
('Distribuidora Libros', 'pedidos@libros.gt', '2777-2222'),
('Suscripciones Digitales', 'contacto@suscripciones.com', '2888-3333'),
('Mobiliario Oficina', 'ventas@mueblesoficina.gt', '2999-4444'),
('Equipos Redes', 'info@equiposredes.com', '2111-5555'),
('Accesorios Móviles', 'pedidos@accesoriosmoviles.gt', '2222-6666'),
('Soluciones Empresariales', 'contacto@soluciones.com', '2333-7777');

-- 3. INSERTAR 50 PRODUCTOS
INSERT INTO product (name, unit_price, stock, id_category, id_supplier) VALUES
('MacBook Air M1 256GB', 7500.00, 15, 1, 1),
('Servicio iPaaS - Plan Profesional', 800.00, 99, 14, 6),
('Libro: From Tool to Partner (HCI)', 450.00, 10, 8, 4),
('Figura de Acción: Minecraft Mannequin (1.21.9)', 120.00, 30, 15, 5),
('Suscripción IconScout Anual', 650.00, 99, 7, 3),
('Libro: Poética de la Edda (Mitología Nórdica)', 210.00, 12, 9, 4),
('Suscripción Overleaf Premium', 350.00, 99, 7, 3),
('Teclado Mecánico Keychron', 850.00, 20, 2, 2),
('Monitor Dell 27" 4K', 3200.00, 8, 3, 1),
('Mouse Logitech MX Master 3', 750.00, 25, 2, 2),
('SSD NVMe 1TB Samsung', 900.00, 40, 5, 1),
('Router WiFi 6 TP-Link', 600.00, 18, 6, 5),
('Memoria RAM 16GB DDR4', 450.00, 50, 4, 1),
('Placa ESP8266 IoT', 85.00, 100, 22, 9),
('Libro: El Mito de Sísifo', 180.00, 15, 9, 4),
('Cable USB-C a HDMI', 150.00, 60, 12, 12),
('Mochila para Laptop 15"', 400.00, 30, 13, 8),
('Silla Ergonómica Mesh', 1200.00, 10, 10, 10),
('Audífonos Sony WH-1000XM4', 2800.00, 12, 11, 11),
('UPS APC 1000VA', 950.00, 20, 16, 7),
('Impresora HP LaserJet', 1500.00, 8, 17, 13),
('Tóner HP Original', 600.00, 25, 18, 13),
('iPad Air 5ta Gen', 5500.00, 10, 19, 1),
('iPhone 15 Pro', 9800.00, 5, 20, 1),
('Webcam Logitech C920', 650.00, 22, 21, 16),
('Kit Sensores Arduino', 250.00, 40, 23, 9),
('Kit Destornilladores iFixit', 550.00, 15, 24, 18),
('Aro de Luz LED con Trípode', 220.00, 35, 25, 19),
('Brazo Articulado para Monitor', 480.00, 18, 26, 20),
('Pasta Térmica Arctic MX-4', 120.00, 50, 27, 21),
('Mousepad XL', 180.00, 45, 28, 22),
('Funda Neopreno 13"', 150.00, 30, 29, 23),
('NVIDIA RTX 4060', 3500.00, 6, 30, 24),
('Motherboard B550', 1100.00, 12, 31, 25),
('Procesador AMD Ryzen 5', 1800.00, 15, 32, 26),
('Fuente de Poder 650W 80+', 750.00, 20, 34, 28),
('Gabinete ATX Cristal Templado', 850.00, 10, 35, 29),
('Interfaz de Audio Focusrite', 1600.00, 8, 36, 30),
('Disco Duro Externo 2TB', 750.00, 25, 37, 31),
('Memoria USB 64GB', 90.00, 80, 38, 32),
('Hub USB-C 7 en 1', 350.00, 40, 39, 33),
('Adaptador WiFi USB', 150.00, 30, 40, 34),
('Cable HDMI 2.1 2m', 120.00, 60, 41, 35),
('Cable Ethernet Cat6 5m', 80.00, 70, 42, 36),
('Powerbank 10000mAh', 250.00, 35, 43, 37),
('Oculus Quest 2', 3200.00, 5, 44, 38),
('Pizarra Acrílica 90x60', 300.00, 15, 46, 40),
('Cuaderno Universitario Moleskine', 180.00, 50, 48, 42),
('Calculadora Casio FX-991', 280.00, 25, 49, 43),
('Termo Yeti 20oz', 350.00, 20, 50, 44);

-- 4. INSERTAR 50 EMPLEADOS
INSERT INTO employee (name, role) VALUES
('Carlos Méndez', 'Vendedor'),
('Ana Lucía Castro', 'Cajero'),
('Roberto Ruiz', 'Gerente de Tienda'),
('María Fernanda López', 'Soporte Técnico'),
('Javier Hernández', 'Vendedor'),
('Sofía Morales', 'Cajero'),
('Diego Barrios', 'Encargado de Bodega'),
('Laura Pinto', 'Atención al Cliente'),
('Andrés Orellana', 'Vendedor'),
('Carmen Estrada', 'Cajero'),
('Luis Felipe Díaz', 'Soporte IT'),
('Valeria Gómez', 'Vendedor'),
('Ricardo Silva', 'Asesor de Software'),
('Mónica Rivas', 'Cajero'),
('Hugo Pineda', 'Vendedor'),
('Gabriela Ortiz', 'Atención al Cliente'),
('Fernando Cruz', 'Encargado de Inventario'),
('Daniela Navas', 'Cajero'),
('Jorge Escobar', 'Vendedor'),
('Paola Reyes', 'Especialista en Redes'),
('Mario Castañeda', 'Vendedor'),
('Lucía Arriaga', 'Cajero'),
('Julio Salazar', 'Asesor Académico'),
('Andrea Montes', 'Vendedor'),
('Pablo Villatoro', 'Cajero'),
('Elena Cifuentes', 'Soporte Técnico'),
('Rodrigo Paz', 'Vendedor'),
('Natalia Lima', 'Cajero'),
('Héctor Rosales', 'Gerente Asistente'),
('Diana Mazariegos', 'Vendedor'),
('Oscar Álvarez', 'Cajero'),
('Silvia Monzón', 'Vendedor'),
('Eduardo Cabrera', 'Atención al Cliente'),
('Karla Figueroa', 'Cajero'),
('Manuel Solares', 'Vendedor'),
('Beatriz Ponce', 'Especialista en Hardware'),
('Víctor Aguilar', 'Cajero'),
('Teresa de León', 'Vendedor'),
('Gustavo Montenegro', 'Encargado de Bodega'),
('Alicia Prado', 'Cajero'),
('René Lemos', 'Vendedor'),
('Cecilia Solís', 'Soporte IT'),
('Esteban Valdés', 'Vendedor'),
('Rosa Fuentes', 'Cajero'),
('Arturo Medina', 'Vendedor'),
('Marta Pineda', 'Atención al Cliente'),
('Guillermo Soto', 'Cajero'),
('Irene Vargas', 'Vendedor'),
('Samuel Mejía', 'Especialista en Envíos'),
('Verónica Gil', 'Cajero');

-- 5. INSERTAR 50 CLIENTES
INSERT INTO client (name, nit, email) VALUES
('Juan Pérez', '1234567-8', 'juan.perez@email.com'),
('María García', '9876543-2', 'mgarcia@email.com'),
('Estudiante UVG 1', 'CF-UVG-1', 'estudiante1@uvg.edu.gt'),
('Pedro Martínez', '5554443-1', 'pmartinez@email.com'),
('Ana Rodriguez', '8887776-9', 'ana.rod@email.com'),
('Luis Fernández', '2223334-5', 'luisf@email.com'),
('Carmen Gómez', '1112223-4', 'cgomez@email.com'),
('Carlos López', '6667778-9', 'clopez@email.com'),
('Jorge Díaz', '9998887-6', 'jdiaz@email.com'),
('Laura Pérez', '4445556-7', 'lperez@email.com'),
('Estudiante UVG 2', 'CF-UVG-2', 'estudiante2@uvg.edu.gt'),
('José Ramírez', '7778889-0', 'jramirez@email.com'),
('Marta Sánchez', '3334445-6', 'msanchez@email.com'),
('Miguel Torres', '1212121-2', 'mtorres@email.com'),
('Lucía Flores', '3434343-4', 'lflores@email.com'),
('Francisco Ruiz', '5656565-6', 'fruiz@email.com'),
('Elena Morales', '7878787-8', 'emorales@email.com'),
('Antonio Ortiz', '9090909-0', 'aortiz@email.com'),
('Paula Cruz', '2323232-3', 'pcruz@email.com'),
('Daniel Castillo', '4545454-5', 'dcastillo@email.com'),
('Sara Reyes', '6767676-7', 'sreyes@email.com'),
('Estudiante UVG 3', 'CF-UVG-3', 'estudiante3@uvg.edu.gt'),
('David Aguilar', '8989898-9', 'daguilar@email.com'),
('Rosa Mendoza', '1313131-3', 'rmendoza@email.com'),
('Alejandro Ríos', '2424242-4', 'arios@email.com'),
('Sofía Vargas', '3535353-5', 'svargas@email.com'),
('Joaquín Navarro', '4646464-6', 'jnavarro@email.com'),
('Teresa Rojas', '5757575-7', 'trojas@email.com'),
('Andrés Delgado', '6868686-8', 'adelgado@email.com'),
('Isabel Vega', '7979797-9', 'ivega@email.com'),
('Rafael Marín', '1414141-4', 'rmarin@email.com'),
('Carmen Soto', '2525252-5', 'csoto@email.com'),
('Alberto Peña', '3636363-6', 'apena@email.com'),
('Silvia Herrera', '4747474-7', 'sherrera@email.com'),
('Guillermo Medina', '5858585-8', 'gmedina@email.com'),
('Beatriz Castro', '6969696-9', 'bcastro@email.com'),
('Estudiante UVG 4', 'CF-UVG-4', 'estudiante4@uvg.edu.gt'),
('Roberto Aguilar', '1515151-5', 'raguilar@email.com'),
('Adriana Salazar', '2626262-6', 'asalazar@email.com'),
('Héctor Guzmán', '3737373-7', 'hguzman@email.com'),
('Verónica Pineda', '4848484-8', 'vpineda@email.com'),
('Ricardo Estrada', '5959595-9', 'restrada@email.com'),
('Natalia Cifuentes', '1616161-6', 'ncifuentes@email.com'),
('Oscar Rompich', '2727272-7', 'orompich@email.com'),
('Daniela Paz', '3838383-8', 'dpaz@email.com'),
('Julio Montes', '4949494-9', 'jmontes@email.com'),
('Mónica Valdés', '1717171-7', 'mvaldes@email.com'),
('Estudiante UVG 5', 'CF-UVG-5', 'estudiante5@uvg.edu.gt'),
('Víctor Fuentes', '2828282-8', 'vfuentes@email.com'),
('Alicia Escobar', '3939393-9', 'aescobar@email.com');

-- 6. INSERTAR 50 VENTAS (Fechas distribuidas para reportes)
INSERT INTO sale (sale_date, id_client, id_employee) VALUES
('2026-01-15 10:30:00', 1, 2),
('2026-01-18 14:45:00', 3, 6),
('2026-02-05 11:15:00', 5, 10),
('2026-02-10 16:20:00', 7, 2),
('2026-02-22 09:10:00', 11, 14),
('2026-03-01 13:50:00', 15, 6),
('2026-03-08 17:05:00', 2, 10),
('2026-03-15 12:30:00', 4, 18),
('2026-03-20 15:40:00', 22, 2),
('2026-04-02 10:00:00', 6, 22),
('2026-04-05 14:15:00', 8, 6),
('2026-04-10 11:45:00', 10, 25),
('2026-04-12 16:30:00', 12, 10),
('2026-04-15 09:20:00', 37, 28),
('2026-04-18 13:10:00', 14, 2),
('2026-04-20 15:55:00', 16, 31),
('2026-04-22 10:40:00', 18, 6),
('2026-04-25 12:05:00', 20, 34),
('2026-04-28 14:25:00', 23, 10),
('2026-04-30 16:50:00', 25, 37),
('2026-05-01 09:15:00', 27, 2),
('2026-05-01 11:30:00', 44, 6),
('2026-05-01 15:45:00', 29, 40),
('2026-05-02 10:20:00', 31, 10),
('2026-05-02 13:00:00', 48, 44),
('2026-05-02 16:10:00', 33, 2),
('2026-05-03 09:45:00', 35, 6),
('2026-05-03 12:15:00', 38, 47),
('2026-05-03 15:30:00', 39, 10),
('2026-05-04 10:05:00', 41, 50),
('2026-05-04 11:20:00', 43, 2),
('2026-05-04 14:40:00', 45, 6),
('2026-05-05 09:30:00', 47, 10),
('2026-05-05 13:55:00', 49, 14),
('2026-05-06 16:25:00', 50, 18),
('2026-05-07 10:10:00', 9, 2),
('2026-05-08 14:35:00', 13, 6),
('2026-05-09 11:50:00', 17, 10),
('2026-05-10 15:15:00', 19, 22),
('2026-05-11 09:40:00', 21, 2),
('2026-05-12 13:20:00', 24, 6),
('2026-05-13 16:05:00', 26, 10),
('2026-05-14 10:30:00', 28, 25),
('2026-05-15 14:50:00', 30, 2),
('2026-05-16 11:10:00', 32, 6),
('2026-05-17 15:40:00', 34, 10),
('2026-05-18 09:55:00', 36, 28),
('2026-05-19 12:25:00', 40, 2),
('2026-05-20 16:15:00', 42, 6),
('2026-05-21 10:45:00', 46, 10);

-- 7. INSERTAR 50 DETALLES DE VENTA (Simulando 1 a 3 productos por venta)
INSERT INTO sale_details (id_sale, id_product, amount, sale_price) VALUES
(1, 1, 1, 7500.00),   -- Venta 1: MacBook Air
(1, 17, 1, 400.00),   -- Venta 1: Mochila
(2, 3, 1, 450.00),    -- Venta 2: Libro HCI
(3, 8, 1, 850.00),    -- Venta 3: Teclado Mecánico
(3, 10, 1, 750.00),   -- Venta 3: Mouse Logitech
(4, 14, 5, 85.00),    -- Venta 4: 5x Placa ESP8266
(5, 5, 1, 650.00),    -- Venta 5: Suscripción IconScout
(6, 4, 1, 120.00),    -- Venta 6: Figura Minecraft
(7, 2, 1, 800.00),    -- Venta 7: Servicio iPaaS
(8, 9, 2, 3200.00),   -- Venta 8: 2x Monitor Dell
(9, 13, 2, 450.00),   -- Venta 9: 2x RAM 16GB
(10, 15, 1, 180.00),  -- Venta 10: El Mito de Sísifo
(10, 6, 1, 210.00),   -- Venta 10: Poética de la Edda
(11, 7, 1, 350.00),   -- Venta 11: Overleaf Premium
(12, 16, 3, 150.00),  -- Venta 12: 3x Cable USB-C a HDMI
(13, 18, 1, 1200.00), -- Venta 13: Silla Ergonómica
(14, 19, 1, 2800.00), -- Venta 14: Audífonos Sony
(15, 20, 1, 950.00),  -- Venta 15: UPS APC
(16, 21, 1, 1500.00), -- Venta 16: Impresora HP
(16, 22, 2, 600.00),  -- Venta 16: 2x Tóner HP
(17, 23, 1, 5500.00), -- Venta 17: iPad Air
(18, 24, 1, 9800.00), -- Venta 18: iPhone 15 Pro
(19, 25, 1, 650.00),  -- Venta 19: Webcam Logitech
(20, 26, 2, 250.00),  -- Venta 20: 2x Kit Sensores Arduino
(21, 27, 1, 550.00),  -- Venta 21: Kit iFixit
(22, 1, 1, 7500.00),  -- Venta 22: MacBook Air (Otra vez)
(22, 39, 1, 350.00),  -- Venta 22: Hub USB-C
(23, 28, 1, 220.00),  -- Venta 23: Aro de Luz
(24, 29, 2, 480.00),  -- Venta 24: 2x Brazo Articulado
(25, 30, 3, 120.00),  -- Venta 25: 3x Pasta Térmica
(26, 31, 1, 180.00),  -- Venta 26: Mousepad XL
(27, 32, 1, 150.00),  -- Venta 27: Funda Neopreno
(28, 33, 1, 3500.00), -- Venta 28: NVIDIA RTX 4060
(29, 34, 1, 1100.00), -- Venta 29: Motherboard B550
(29, 35, 1, 1800.00), -- Venta 29: Procesador Ryzen 5
(30, 36, 1, 750.00),  -- Venta 30: Fuente de Poder
(31, 37, 1, 850.00),  -- Venta 31: Gabinete ATX
(32, 38, 1, 1600.00), -- Venta 32: Interfaz Focusrite
(33, 41, 2, 120.00),  -- Venta 33: 2x Cable HDMI
(34, 42, 5, 80.00),   -- Venta 34: 5x Cable Ethernet
(35, 43, 1, 250.00),  -- Venta 35: Powerbank
(36, 44, 1, 3200.00), -- Venta 36: Oculus Quest 2
(37, 46, 1, 300.00),  -- Venta 37: Pizarra Acrílica
(38, 48, 4, 180.00),  -- Venta 38: 4x Cuaderno Moleskine
(39, 49, 1, 280.00),  -- Venta 39: Calculadora Casio
(40, 50, 2, 350.00),  -- Venta 40: 2x Termo Yeti
(41, 14, 10, 85.00),  -- Venta 41: 10x Placa ESP8266
(42, 4, 2, 120.00),   -- Venta 42: 2x Figura Minecraft
(43, 8, 1, 850.00),   -- Venta 43: Teclado Mecánico
(44, 3, 1, 450.00);   -- Venta 44: Libro HCI