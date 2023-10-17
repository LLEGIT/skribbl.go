-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: my_go_db
-- ------------------------------------------------------
-- Server version	8.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `avatar`
--

DROP TABLE IF EXISTS `avatar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avatar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avatar`
--

LOCK TABLES `avatar` WRITE;
/*!40000 ALTER TABLE `avatar` DISABLE KEYS */;
INSERT INTO `avatar` VALUES (1,'poney_1','assets/poney_1.png');
INSERT INTO `avatar` VALUES (2,'poney_2','assets/poney_2.png');
INSERT INTO `avatar` VALUES (3,'poney_3','assets/poney_3.png');
INSERT INTO `avatar` VALUES (4,'poney_4','assets/poney_4.png');
INSERT INTO `avatar` VALUES (5,'poney_5','assets/poney_5.png');
INSERT INTO `avatar` VALUES (6,'poney_6','assets/poney_6.png');
INSERT INTO `avatar` VALUES (7,'poney_7','assets/poney_7.png');
INSERT INTO `avatar` VALUES (8,'poney_8','assets/poney_8.png');
/*!40000 ALTER TABLE `avatar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player`
--

DROP TABLE IF EXISTS `player`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `room_id` int NOT NULL,
  `avatar_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_admin` tinyint(1) NOT NULL,
  `score` int NOT NULL DEFAULT '0',
  `found_word` tinyint(1) NOT NULL DEFAULT '0',
  `is_drawing` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `room_id_fk` (`room_id`),
  KEY `avatar_id_fk` (`avatar_id`),
  CONSTRAINT `avatar_id_fk` FOREIGN KEY (`avatar_id`) REFERENCES `avatar` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `room_id_fk` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `players_number` int NOT NULL,
  `draw_time` int NOT NULL,
  `rounds` int NOT NULL,
  `current_word` varchar(255) DEFAULT NULL,
  `is_private` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `current_round` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `room_drawing`
--

DROP TABLE IF EXISTS `room_drawing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_drawing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `src` text NOT NULL,
  `room_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_room_id` (`room_id`),
  CONSTRAINT `room_drawing_FK` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2611 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_drawing`
--

LOCK TABLES `room_drawing` WRITE;
/*!40000 ALTER TABLE `room_drawing` DISABLE KEYS */;
/*!40000 ALTER TABLE `room_drawing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_message`
--

DROP TABLE IF EXISTS `room_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `room_id` int NOT NULL,
  `message` varchar(255) NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `player_id_fk` (`player_id`),
  KEY `room_id_fk2` (`room_id`),
  CONSTRAINT `player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `room_id_fk2` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_message`
--

LOCK TABLES `room_message` WRITE;
/*!40000 ALTER TABLE `room_message` DISABLE KEYS */;
/*!40000 ALTER TABLE `room_message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `word`
--

DROP TABLE IF EXISTS `word`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `word` (
  `id` int NOT NULL AUTO_INCREMENT,
  `word` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `word`
--

LOCK TABLES `word` WRITE;
/*!40000 ALTER TABLE `word` DISABLE KEYS */;
INSERT INTO `word` VALUES (1,'pomme');
INSERT INTO `word` VALUES (2,'chat');
INSERT INTO `word` VALUES (3,'voiture');
INSERT INTO `word` VALUES (4,'maison');
INSERT INTO `word` VALUES (5,'fleur');
INSERT INTO `word` VALUES (6,'soleil');
INSERT INTO `word` VALUES (7,'livre');
INSERT INTO `word` VALUES (8,'arbre');
INSERT INTO `word` VALUES (9,'montagne');
INSERT INTO `word` VALUES (10,'mer');
INSERT INTO `word` VALUES (11,'oiseau');
INSERT INTO `word` VALUES (12,'chien');
INSERT INTO `word` VALUES (13,'étoile');
INSERT INTO `word` VALUES (14,'amour');
INSERT INTO `word` VALUES (15,'école');
INSERT INTO `word` VALUES (16,'travail');
INSERT INTO `word` VALUES (17,'chocolat');
INSERT INTO `word` VALUES (18,'bonheur');
INSERT INTO `word` VALUES (19,'fenêtre');
INSERT INTO `word` VALUES (20,'jardin');
INSERT INTO `word` VALUES (21,'chemin');
INSERT INTO `word` VALUES (22,'musique');
INSERT INTO `word` VALUES (23,'hiver');
INSERT INTO `word` VALUES (24,'été');
INSERT INTO `word` VALUES (25,'automne');
INSERT INTO `word` VALUES (26,'printemps');
INSERT INTO `word` VALUES (27,'bureau');
INSERT INTO `word` VALUES (28,'famille');
INSERT INTO `word` VALUES (29,'ami');
INSERT INTO `word` VALUES (30,'plage');
INSERT INTO `word` VALUES (31,'restaurant');
INSERT INTO `word` VALUES (32,'cinéma');
INSERT INTO `word` VALUES (33,'théâtre');
INSERT INTO `word` VALUES (34,'avion');
INSERT INTO `word` VALUES (35,'train');
INSERT INTO `word` VALUES (36,'vélo');
INSERT INTO `word` VALUES (37,'ordinateur');
INSERT INTO `word` VALUES (38,'téléphone');
INSERT INTO `word` VALUES (39,'internet');
INSERT INTO `word` VALUES (40,'photo');
INSERT INTO `word` VALUES (41,'vacances');
INSERT INTO `word` VALUES (42,'montre');
INSERT INTO `word` VALUES (43,'crayon');
INSERT INTO `word` VALUES (44,'festival');
INSERT INTO `word` VALUES (45,'chanson');
INSERT INTO `word` VALUES (46,'voyage');
INSERT INTO `word` VALUES (47,'carte');
INSERT INTO `word` VALUES (48,'passion');
INSERT INTO `word` VALUES (49,'couleur');
INSERT INTO `word` VALUES (50,'espoir');
INSERT INTO `word` VALUES (51,'rêve');
INSERT INTO `word` VALUES (52,'énergie');
INSERT INTO `word` VALUES (53,'café');
INSERT INTO `word` VALUES (54,'billet');
INSERT INTO `word` VALUES (55,'parc');
INSERT INTO `word` VALUES (56,'église');
INSERT INTO `word` VALUES (57,'cathédrale');
INSERT INTO `word` VALUES (58,'métro');
INSERT INTO `word` VALUES (59,'bus');
INSERT INTO `word` VALUES (60,'bateau');
INSERT INTO `word` VALUES (61,'dîner');
INSERT INTO `word` VALUES (62,'déjeuner');
INSERT INTO `word` VALUES (63,'petit-déjeuner');
INSERT INTO `word` VALUES (64,'pain');
INSERT INTO `word` VALUES (65,'fromage');
INSERT INTO `word` VALUES (66,'vin');
INSERT INTO `word` VALUES (67,'bière');
INSERT INTO `word` VALUES (68,'eau');
INSERT INTO `word` VALUES (69,'cuisine');
INSERT INTO `word` VALUES (70,'lumière');
INSERT INTO `word` VALUES (71,'ombre');
INSERT INTO `word` VALUES (72,'film');
INSERT INTO `word` VALUES (73,'acteur');
INSERT INTO `word` VALUES (74,'actrice');
INSERT INTO `word` VALUES (75,'réalisateur');
INSERT INTO `word` VALUES (76,'scénario');
INSERT INTO `word` VALUES (77,'caméra');
INSERT INTO `word` VALUES (78,'écran');
INSERT INTO `word` VALUES (79,'spectacle');
INSERT INTO `word` VALUES (80,'spectateur');
INSERT INTO `word` VALUES (81,'artistique');
INSERT INTO `word` VALUES (82,'créativité');
INSERT INTO `word` VALUES (83,'expression');
INSERT INTO `word` VALUES (84,'passionné');
INSERT INTO `word` VALUES (85,'sourire');
INSERT INTO `word` VALUES (86,'rire');
INSERT INTO `word` VALUES (87,'pleurer');
INSERT INTO `word` VALUES (88,'mystère');
INSERT INTO `word` VALUES (89,'aventure');
INSERT INTO `word` VALUES (90,'histoire');
INSERT INTO `word` VALUES (91,'culture');
INSERT INTO `word` VALUES (92,'tradition');
INSERT INTO `word` VALUES (93,'éducation');
INSERT INTO `word` VALUES (94,'science');
INSERT INTO `word` VALUES (95,'technologie');
INSERT INTO `word` VALUES (96,'futur');
INSERT INTO `word` VALUES (97,'passé');
INSERT INTO `word` VALUES (98,'présent');
INSERT INTO `word` VALUES (99,'Paris');
INSERT INTO `word` VALUES (100,'Tour Eiffel');
INSERT INTO `word` VALUES (101,'Louvre');
INSERT INTO `word` VALUES (102,'Versailles');
INSERT INTO `word` VALUES (103,'Mont Saint-Michel');
INSERT INTO `word` VALUES (104,'Côte d\'Azur');
INSERT INTO `word` VALUES (105,'Château de Chambord');
INSERT INTO `word` VALUES (106,'Notre-Dame de Paris');
INSERT INTO `word` VALUES (107,'Monet');
INSERT INTO `word` VALUES (108,'Marie Curie');
INSERT INTO `word` VALUES (109,'Napoleon');
INSERT INTO `word` VALUES (110,'Victor Hugo');
INSERT INTO `word` VALUES (111,'Coco Chanel');
INSERT INTO `word` VALUES (112,'Voltaire');
INSERT INTO `word` VALUES (113,'Brigitte Bardot');
INSERT INTO `word` VALUES (114,'Claude Monet');
INSERT INTO `word` VALUES (115,'Julia Child');
INSERT INTO `word` VALUES (116,'Albert Camus');
INSERT INTO `word` VALUES (117,'Simone de Beauvoir');
INSERT INTO `word` VALUES (118,'René Descartes');
INSERT INTO `word` VALUES (119,'Marie Antoinette');
INSERT INTO `word` VALUES (120,'Louis Pasteur');
INSERT INTO `word` VALUES (121,'Jeanne d\'Arc');
INSERT INTO `word` VALUES (122,'Édith Piaf');
INSERT INTO `word` VALUES (123,'Gustave Eiffel');
INSERT INTO `word` VALUES (124,'Edgar Degas');
INSERT INTO `word` VALUES (125,'Leonardo da Vinci');
INSERT INTO `word` VALUES (126,'Mona Lisa');
INSERT INTO `word` VALUES (127,'Louisa May Alcott');
INSERT INTO `word` VALUES (128,'Antoine de Saint-Exupéry');
INSERT INTO `word` VALUES (129,'Pierre Curie');
INSERT INTO `word` VALUES (130,'Marcel Proust');
INSERT INTO `word` VALUES (131,'Paul Cézanne');
/*!40000 ALTER TABLE `word` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'my_go_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-15 22:39:38
