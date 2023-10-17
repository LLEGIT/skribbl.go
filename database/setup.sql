-- MySQL dump 10.13  Distrib 8.1.0, for Linux (x86_64)
--
-- Host: localhost    Database: my_go_db
-- ------------------------------------------------------
-- Server version       8.1.0

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avatar`
--

LOCK TABLES `avatar` WRITE;
/*!40000 ALTER TABLE `avatar` DISABLE KEYS */;
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
  `created_at` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id_fk` (`room_id`),
  KEY `avatar_id_fk` (`avatar_id`),
  CONSTRAINT `avatar_id_fk` FOREIGN KEY (`avatar_id`) REFERENCES `avatar` (`id`),
  CONSTRAINT `room_id_fk` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player`
--

LOCK TABLES `player` WRITE;
/*!40000 ALTER TABLE `player` DISABLE KEYS */;
/*!40000 ALTER TABLE `player` ENABLE KEYS */;
UNLOCK TABLES;

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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
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
  `created_at` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  KEY `player_id_fk` (`player_id`),
  KEY `room_id_fk2` (`room_id`),
  CONSTRAINT `player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player` (`id`),
  CONSTRAINT `room_id_fk2` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`)
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
INSERT INTO `word` VALUES (1,'pomme'),(2,'chat'),(3,'voiture'),(4,'maison'),(5,'fleur'),(6,'soleil'),(7,'livre'),(8,'arbre'),(9,'montagne'),(10,'mer'),(11,'oiseau'),(12,'chien'),(13,'étoile'),(14,'amour'),(15,'école'),(16,'travail'),(17,'chocolat'),(18,'bonheur'),(19,'fenêtre'),(20,'jardin'),(21,'chemin'),(22,'musique'),(23,'hiver'),(24,'été'),(25,'automne'),(26,'printemps'),(27,'bureau'),(28,'famille'),(29,'ami'),(30,'plage'),(31,'restaurant'),(32,'cinéma'),(33,'théâtre'),(34,'avion'),(35,'train'),(36,'vélo'),(37,'ordinateur'),(38,'téléphone'),(39,'internet'),(40,'photo'),(41,'vacances'),(42,'montre'),(43,'crayon'),(44,'festival'),(45,'chanson'),(46,'voyage'),(47,'carte'),(48,'passion'),(49,'couleur'),(50,'espoir'),(51,'rêve'),(52,'énergie'),(53,'café'),(54,'billet'),(55,'parc'),(56,'église'),(57,'cathédrale'),(58,'métro'),(59,'bus'),(60,'bateau'),(61,'dîner'),(62,'déjeuner'),(63,'petit-déjeuner'),(64,'pain'),(65,'fromage'),(66,'vin'),(67,'bière'),(68,'eau'),(69,'cuisine'),(70,'lumière'),(71,'ombre'),(72,'film'),(73,'acteur'),(74,'actrice'),(75,'réalisateur'),(76,'scénario'),(77,'caméra'),(78,'écran'),(79,'spectacle'),(80,'spectateur'),(81,'artistique'),(82,'créativité'),(83,'expression'),(84,'passionné'),(85,'sourire'),(86,'rire'),(87,'pleurer'),(88,'mystère'),(89,'aventure'),(90,'histoire'),(91,'culture'),(92,'tradition'),(93,'éducation'),(94,'science'),(95,'technologie'),(96,'futur'),(97,'passé'),(98,'présent'),(99,'Paris'),(100,'Tour Eiffel'),(101,'Louvre'),(102,'Versailles'),(103,'Mont Saint-Michel'),(104,'Côte d\'Azur'),(105,'Château de Chambord'),(106,'Notre-Dame de Paris'),(107,'Monet'),(108,'Marie Curie'),(109,'Napoleon'),(110,'Victor Hugo'),(111,'Coco Chanel'),(112,'Voltaire'),(113,'Brigitte Bardot'),(114,'Claude Monet'),(115,'Julia Child'),(116,'Albert Camus'),(117,'Simone de Beauvoir'),(118,'René Descartes'),(119,'Marie Antoinette'),(120,'Louis Pasteur'),(121,'Jeanne d\'Arc'),(122,'Édith Piaf'),(123,'Gustave Eiffel'),(124,'Edgar Degas'),(125,'Leonardo da Vinci'),(126,'Mona Lisa'),(127,'Louisa May Alcott'),(128,'Antoine de Saint-Exupéry'),(129,'Pierre Curie'),(130,'Marcel Proust'),(131,'Paul Cézanne');
/*!40000 ALTER TABLE `word` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-04 10:48:43